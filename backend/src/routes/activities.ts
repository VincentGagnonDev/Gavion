import { Router, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { authenticate, AuthRequest, authorizeResource } from '../middleware/auth';
import { param, body, validationResult } from 'express-validator';

const router = Router();

const validateActivityId = param('id').isUUID();

const validateActivityCreate = [
  body('type').trim().notEmpty().withMessage('Activity type is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').optional().trim(),
  body('scheduledAt').optional().isISO8601(),
  body('completedAt').optional().isISO8601(),
  body('entityType').optional().isIn(['lead', 'opportunity', 'contact', 'project', 'ticket', 'activity']),
  body('entityId').optional().isUUID(),
];

const validateActivityUpdate = [
  validateActivityId,
  body('type').optional().trim(),
  body('subject').optional().trim(),
  body('description').optional().trim(),
  body('scheduledAt').optional().isISO8601(),
  body('completedAt').optional().isISO8601(),
];

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId, ownerId, type, startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (entityType && entityId) {
      if (entityType === 'lead') where.leadId = entityId;
      if (entityType === 'opportunity') where.opportunityId = entityId;
      if (entityType === 'contact') where.contactId = entityId;
    }
    if (ownerId) where.ownerId = ownerId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } },
          lead: { select: { id: true, companyName: true } },
          opportunity: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true, jobTitle: true } }
        }
      }),
      db.activity.count({ where })
    ]);

    res.json({
      activities,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', 
  validateActivityId,
  authenticate,
  authorizeResource('Activity', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activity = await db.activity.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        lead: true,
        opportunity: true,
        contact: true
      }
    });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

router.post('/', 
  authenticate,
  validateActivityCreate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { leadId, opportunityId, contactId, type, subject, description, 
      scheduledAt, completedAt, durationMinutes, outcome, sentiment, keyTopics } = req.body;

    const activity = await db.activity.create({
      data: {
        ownerId: req.user!.id,
        leadId, opportunityId, contactId,
        type: type || 'NOTE',
        subject, description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        durationMinutes, outcome, sentiment,
        keyTopics: keyTopics || []
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  validateActivityUpdate,
  authenticate,
  authorizeResource('Activity', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, subject, description, scheduledAt, completedAt, 
      durationMinutes, outcome, sentiment, keyTopics } = req.body;

    const activity = await db.activity.update({
      where: { id: req.params.id },
      data: {
        type, subject, description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        durationMinutes, outcome, sentiment, keyTopics
      }
    });

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', 
  validateActivityId,
  authenticate,
  authorizeResource('Activity', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.activity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/types/list', async (_req: AuthRequest, res: Response) => {
  res.json(['MEETING', 'CALL', 'EMAIL', 'DEMO', 'WORKSHOP', 'NOTE', 'TASK', 'OTHER']);
});

export default router;
