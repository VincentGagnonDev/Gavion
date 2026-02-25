import { Router, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { authenticate, authorize, AuthRequest, authorizeResource } from '../middleware/auth';
import { LeadStatus } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';

const router = Router();

const validateLeadId = param('id').isUUID();
const validateCreateLead = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('contactName').trim().notEmpty().withMessage('Contact name is required'),
  body('contactEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('contactPhone').optional().trim(),
  body('source').optional().trim(),
  body('industry').optional().trim(),
  body('companySize').optional().trim(),
];
const validateUpdateLead = [
  param('id').isUUID(),
  body('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST']),
  body('companyName').optional().trim(),
  body('contactEmail').optional().isEmail(),
  body('leadScore').optional().isInt({ min: 0, max: 100 }),
];

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, source, ownerId, search, page = 1, limit = 20 } = req.query as any;
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

router.get('/:id', 
  validateLeadId,
  authenticate,
  authorizeResource('Lead', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await db.lead.findUnique({
      where: { id: req.params.id as string },
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

router.post('/', 
  authenticate,
  ...validateCreateLead,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { companyName, contactName, contactEmail, contactPhone, source, sourceDetails, 
      industry, companySize, budgetRange, timeline, needDescription } = req.body;

    const lead = await db.lead.create({
      data: {
        ownerId: req.user!.id,
        companyName, contactName, contactEmail, contactPhone,
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

router.put('/:id', 
  authenticate,
  validateUpdateLead,
  authorizeResource('Lead', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, companyName, contactName, contactEmail, contactPhone, industry,
      companySize, budgetRange, timeline, needDescription, leadScore, scoreTier, scoreReason } = req.body;

    const lead = await db.lead.update({
      where: { id: req.params.id as string },
      data: { status, companyName, contactName, contactEmail, contactPhone, industry,
        companySize, budgetRange, timeline, needDescription, leadScore, scoreTier, scoreReason }
    });

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/convert', 
  authenticate,
  validateLeadId,
  authorizeResource('Lead', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await db.lead.findUnique({ where: { id: req.params.id as string } });
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
        where: { id: req.params.id as string },
        data: { status: 'CONVERTED', convertedAt: new Date() }
      })
    ]);

    res.status(201).json(opportunity);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/lost', 
  authenticate,
  validateLeadId,
  authorizeResource('Lead', 'ownerId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lossReason } = req.body;
    const lead = await db.lead.update({
      where: { id: req.params.id as string },
      data: { status: 'LOST', lostAt: new Date(), lossReason }
    });
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

export default router;
