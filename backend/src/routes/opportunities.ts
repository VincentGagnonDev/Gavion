import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { OpportunityStage } from '../../generated/prisma';

const router = Router();

router.use(authenticate);

const stageProbabilities: Record<OpportunityStage, number> = {
  LEAD_INGESTION: 10,
  QUALIFICATION: 20,
  DISCOVERY: 40,
  SOLUTION_DESIGN: 60,
  PROPOSAL: 75,
  NEGOTIATION: 90,
  CLOSED_WON: 100,
  CLOSED_LOST: 0
};

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stage, ownerId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { client: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    if (req.user?.role === 'SALES_REPRESENTATIVE') {
      where.ownerId = req.user.id;
    }

    const [opportunities, total] = await Promise.all([
      db.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { expectedCloseDate: 'asc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } },
          client: { select: { id: true, name: true } },
          lead: { select: { id: true, companyName: true } }
        }
      }),
      db.opportunity.count({ where })
    ]);

    res.json({
      opportunities,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/pipeline', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {
      stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
    };

    if (req.user?.role === 'SALES_REPRESENTATIVE') {
      where.ownerId = req.user.id;
    }

    const opportunities = await db.opportunity.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        owner: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { expectedCloseDate: 'asc' }
    });

    const pipelineByStage = Object.values(OpportunityStage)
      .filter(s => s !== 'CLOSED_WON' && s !== 'CLOSED_LOST')
      .map(stage => ({
        stage,
        opportunities: opportunities.filter(o => o.stage === stage),
        totalValue: opportunities
          .filter(o => o.stage === stage)
          .reduce((sum, o) => sum + o.estimatedValue, 0),
        weightedValue: opportunities
          .filter(o => o.stage === stage)
          .reduce((sum, o) => sum + o.weightedValue, 0),
        count: opportunities.filter(o => o.stage === stage).length
      }));

    res.json(pipelineByStage);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const opportunity = await db.opportunity.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        client: true,
        lead: true,
        proposals: { orderBy: { version: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
        project: true
      }
    });
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opportunity);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, clientId, leadId, estimatedValue, expectedCloseDate, solutionType, nextStep } = req.body;

    const opportunity = await db.opportunity.create({
      data: {
        ownerId: req.user!.id,
        clientId, leadId, name, estimatedValue: estimatedValue || 0,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        solutionType, nextStep, probability: 10
      }
    });

    res.status(201).json(opportunity);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, stage, probability, estimatedValue, expectedCloseDate, 
      nextStep, nextStepDate, solutionType, lostReason, wonReason } = req.body;

    let weightedValue = 0;
    if (estimatedValue && probability) {
      weightedValue = estimatedValue * (probability / 100);
    }

    const opportunity = await db.opportunity.update({
      where: { id: req.params.id },
      data: {
        name, stage, probability, estimatedValue, expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
        nextStep, nextStepDate: nextStepDate ? new Date(nextStepDate) : undefined,
        solutionType, lostReason, wonReason, weightedValue
      }
    });

    res.json(opportunity);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/close-won', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { createProject } = req.body;

    const [opportunity] = await db.$transaction([
      db.opportunity.update({
        where: { id: req.params.id },
        data: { 
          stage: 'CLOSED_WON', 
          actualCloseDate: new Date(),
          probability: 100,
          weightedValue: 0
        }
      })
    ]);

    if (createProject && opportunity.clientId) {
      await db.project.create({
        data: {
          opportunityId: opportunity.id,
          clientId: opportunity.clientId,
          name: opportunity.name,
          solutionType: opportunity.solutionType,
          status: 'NOT_STARTED',
          budget: opportunity.estimatedValue
        }
      });
    }

    res.json(opportunity);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/close-lost', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lostReason } = req.body;

    const opportunity = await db.opportunity.update({
      where: { id: req.params.id },
      data: { 
        stage: 'CLOSED_LOST', 
        actualCloseDate: new Date(),
        probability: 0,
        weightedValue: 0,
        lostReason
      }
    });

    res.json(opportunity);
  } catch (error) {
    next(error);
  }
});

export default router;
