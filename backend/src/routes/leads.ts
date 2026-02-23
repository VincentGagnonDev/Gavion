import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { LeadStatus } from '../../generated/prisma';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, source, ownerId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { contactName: { contains: search as string, mode: 'insensitive' } },
        { contactEmail: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (req.user?.role === 'SALES_REPRESENTATIVE') {
      where.ownerId = req.user.id;
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } },
          client: { select: { id: true, name: true } }
        }
      }),
      db.lead.count({ where })
    ]);

    res.json({
      leads,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await db.lead.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        client: true,
        opportunities: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { companyName, contactName, contactEmail, contactPhone, source, sourceDetails, 
      industry, companySize, budgetRange, timeline, needDescription } = req.body;

    const lead = await db.lead.create({
      data: {
        ownerId: req.user!.id,
       Name, contactEmail companyName, contact, contactPhone,
        source, sourceDetails, industry, companySize,
        budgetRange, timeline, needDescription,
        leadScore: 0,
        scoreTier: 'Cold'
      }
    });

    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, companyName, contactName, contactEmail, contactPhone, industry,
      companySize, budgetRange, timeline, needDescription, leadScore, scoreTier, scoreReason } = req.body;

    const lead = await db.lead.update({
      where: { id: req.params.id },
      data: { status, companyName, contactName, contactEmail, contactPhone, industry,
        companySize, budgetRange, timeline, needDescription, leadScore, scoreTier, scoreReason }
    });

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/convert', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await db.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { name, estimatedValue, expectedCloseDate, solutionType } = req.body;

    const [opportunity] = await db.$transaction([
      db.opportunity.create({
        data: {
          leadId: lead.id,
          clientId: lead.clientId || undefined,
          ownerId: req.user!.id,
          name: name || `${lead.companyName} - ${solutionType || 'AI Solution'}`,
          estimatedValue: estimatedValue || 0,
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
          solutionType,
          stage: 'LEAD_INGESTION'
        }
      }),
      db.lead.update({
        where: { id: req.params.id },
        data: { status: 'CONVERTED', convertedAt: new Date() }
      })
    ]);

    res.status(201).json(opportunity);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/lost', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lossReason } = req.body;
    const lead = await db.lead.update({
      where: { id: req.params.id },
      data: { status: 'LOST', lostAt: new Date(), lossReason }
    });
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

export default router;
