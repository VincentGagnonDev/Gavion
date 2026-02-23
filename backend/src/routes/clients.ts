import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest, isSalesUser, isAdmin, isProjectUser } from '../../middleware/auth';
import { Prisma } from '../../generated/prisma';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, industry, lifecycleStage, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { legalName: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (industry) where.industry = industry;
    if (lifecycleStage) where.lifecycleStage = lifecycleStage;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (req.user?.role === 'SALES_REPRESENTATIVE') {
      where.accountExecutiveId = req.user.id;
    } else if (req.user?.role === 'AI_PROJECT_MANAGER') {
      where.projects = {
        some: { projectManagerId: req.user.id }
      };
    }

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          industry: true,
          size: true,
          lifecycleStage: true,
          healthScore: true,
          npsScore: true,
          isActive: true,
          createdAt: true,
          _count: { select: { projects: true, contacts: true, opportunities: true } }
        }
      }),
      db.client.count({ where })
    ]);

    res.json({
      clients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const client = await db.client.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: {
          where: { isActive: true },
          orderBy: { lastName: 'asc' }
        },
        projects: {
          where: { status: { not: 'COMPLETED' } },
          select: {
            id: true,
            name: true,
            status: true,
            healthStatus: true,
            completionPercentage: true
          }
        },
        opportunities: {
          where: { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } },
          select: {
            id: true,
            name: true,
            stage: true,
            estimatedValue: true,
            probability: true
          }
        },
        _count: { select: { tickets: true, feedback: true } }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'), 
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name, legalName, industry, industryCode, size, revenueBand,
      address, city, country, phone, website,
      aiMaturityLevel, technologyStack, lifecycleStage,
      contractStartDate, contractEndDate, autoRenewal
    } = req.body;

    const client = await db.client.create({
      data: {
        name,
        legalName,
        industry,
        industryCode,
        size,
        revenueBand,
        address,
        city,
        country,
        phone,
        website,
        aiMaturityLevel,
        technologyStack: technologyStack || [],
        lifecycleStage: lifecycleStage || 'PROSPECT',
        contractStartDate: contractStartDate ? new Date(contractStartDate) : null,
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        autoRenewal: autoRenewal || false,
        accountExecutiveId: req.user?.id
      }
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
);

router.put('/:id', authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'), 
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name, legalName, industry, industryCode, size, revenueBand,
      address, city, country, phone, website,
      aiMaturityLevel, aiReadinessScore, technologyStack,
      lifecycleStage, healthScore, npsScore,
      contractStartDate, contractEndDate, autoRenewal, isActive
    } = req.body;

    const client = await db.client.update({
      where: { id: req.params.id },
      data: {
        name, legalName, industry, industryCode, size, revenueBand,
        address, city, country, phone, website,
        aiMaturityLevel, aiReadinessScore, technologyStack,
        lifecycleStage, healthScore, npsScore,
        contractStartDate: contractStartDate ? new Date(contractStartDate) : undefined,
        contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined,
        autoRenewal, isActive
      }
    });

    res.json(client);
  } catch (error) {
    next(error);
  }
);

router.delete('/:id', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.client.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Client deactivated' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/contacts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      firstName, lastName, email, phone, jobTitle,
      isDecisionMaker, isInfluencer, isTechnicalLead, isEndUser, isBudgetHolder,
      influenceLevel, preferredChannel
    } = req.body;

    const contact = await db.contact.create({
      data: {
        clientId: req.params.id,
        firstName, lastName, email, phone, jobTitle,
        isDecisionMaker: isDecisionMaker || false,
        isInfluencer: isInfluencer || false,
        isTechnicalLead: isTechnicalLead || false,
        isEndUser: isEndUser || false,
        isBudgetHolder: isBudgetHolder || false,
        influenceLevel: influenceLevel || 50,
        preferredChannel
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/contacts/:contactId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      firstName, lastName, email, phone, jobTitle,
      isDecisionMaker, isInfluencer, isTechnicalLead, isEndUser, isBudgetHolder,
      influenceLevel, relationshipScore, preferredChannel, isActive
    } = req.body;

    const contact = await db.contact.update({
      where: { id: req.params.contactId },
      data: {
        firstName, lastName, email, phone, jobTitle,
        isDecisionMaker, isInfluencer, isTechnicalLead, isEndUser, isBudgetHolder,
        influenceLevel, relationshipScore, preferredChannel, isActive
      }
    });

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/health', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const client = await db.client.findUnique({
      where: { id: req.params.id },
      include: {
        projects: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          select: { healthStatus: true }
        },
        tickets: {
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          select: { severity: true, status: true }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const projectHealthCounts = client.projects.reduce((acc, p) => {
      acc[p.healthStatus] = (acc[p.healthStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentTicketCount = client.tickets.length;
    const criticalTickets = client.tickets.filter(t => t.severity === 'CRITICAL' && t.status !== 'RESOLVED').length;

    res.json({
      healthScore: client.healthScore,
      projectHealth: projectHealthCounts,
      recentTickets: recentTicketCount,
      criticalTickets,
      lifecycleStage: client.lifecycleStage
    });
  } catch (error) {
    next(error);
  }
});

export default router;
