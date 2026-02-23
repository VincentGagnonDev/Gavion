import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

const slaResponseHours: Record<string, number> = { CRITICAL: 1, HIGH: 4, MEDIUM: 8, LOW: 24 };
const slaResolutionHours: Record<string, number> = { CRITICAL: 4, HIGH: 24, MEDIUM: 72, LOW: 120 };

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, severity, assigneeId, clientId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (assigneeId) where.assigneeId = assigneeId;
    if (clientId) where.clientId = clientId;

    if (req.user?.role === 'AI_PROJECT_MANAGER' || req.user?.role === 'AI_EXPERT') {
      where.assigneeId = req.user.id;
    }

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } }
        }
      }),
      db.ticket.count({ where })
    ]);

    res.json({
      tickets,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = { status: { notIn: ['RESOLVED', 'CLOSED'] } };

    const [openTickets, bySeverity, byStatus] = await Promise.all([
      db.ticket.count({ where }),
      db.ticket.groupBy({ by: ['severity'], where, _count: { id: true } }),
      db.ticket.groupBy({ by: ['status'], where, _count: { id: true } })
    ]);

    res.json({
      openTickets,
      bySeverity: bySeverity.reduce((acc, s) => { acc[s.severity] = s._count.id; return acc; }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, s) => { acc[s.status] = s._count.id; return acc; }, {} as Record<string, number>)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ticket = await db.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        comments: { include: { author: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'asc' } }
      }
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { clientId, title, description, type, severity } = req.body;

    const ticketCount = await db.ticket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

    const now = new Date();
    const responseDue = new Date(now.getTime() + slaResponseHours[severity] * 60 * 60 * 1000);
    const resolutionDue = new Date(now.getTime() + slaResolutionHours[severity] * 60 * 60 * 1000);

    const ticket = await db.ticket.create({
      data: {
        clientId, ticketNumber, title, description,
        type: type || 'TECHNICAL_ISSUE',
        severity: severity || 'MEDIUM',
        slaResponseDue: responseDue,
        slaResolutionDue: resolutionDue
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, assigneeId, resolution, rootCause } = req.body;

    const updateData: any = { status, assigneeId };
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      updateData.resolution = resolution;
    }
    if (status === 'CLOSED') updateData.closedAt = new Date();
    if (rootCause) updateData.rootCause = rootCause;

    const ticket = await db.ticket.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, isInternal } = req.body;

    const comment = await db.ticketComment.create({
      data: {
        ticketId: req.params.id,
        authorId: req.user!.id,
        content, isInternal: isInternal || false
      }
    });

    const ticket = await db.ticket.findUnique({ where: { id: req.params.id } });
    if (ticket && !ticket.respondedAt) {
      await db.ticket.update({
        where: { id: req.params.id },
        data: { respondedAt: new Date(), status: 'IN_PROGRESS' }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

export default router;
