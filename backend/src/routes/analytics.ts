import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { OpportunityStage, ProjectStatus } from '../../generated/prisma';

const router = Router();

router.use(authenticate);

router.get('/sales', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const where = {
      createdAt: { gte: start, lte: end }
    };

    const [
      totalPipeline,
      pipelineByStage,
      opportunitiesCreated,
      closedWon,
      winRate,
      avgDealSize
    ] = await Promise.all([
      db.opportunity.aggregate({
        where: { ...where, stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } },
        _sum: { estimatedValue: true },
        _avg: { estimatedValue: true }
      }),
      db.opportunity.groupBy({
        by: ['stage'],
        where: { ...where, stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } },
        _count: { id: true },
        _sum: { estimatedValue: true }
      }),
      db.opportunity.count({ where }),
      db.opportunity.count({ where: { ...where, stage: 'CLOSED_WON' } }),
      db.opportunity.groupBy({
        by: ['stage'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true }
      }),
      db.opportunity.aggregate({
        where: { ...where, stage: 'CLOSED_WON' },
        _avg: { estimatedValue: true }
      })
    ]);

    const totalClosed = closedWon;
    const totalLost = winRate.find(s => s.stage === 'CLOSED_LOST')?._count.id || 0;
    const overallWinRate = totalClosed + totalLost > 0 
      ? (totalClosed / (totalClosed + totalLost)) * 100 
      : 0;

    res.json({
      totalPipeline: totalPipeline._sum.estimatedValue || 0,
      pipelineByStage: pipelineByStage.map(s => ({
        stage: s.stage,
        count: s._count.id,
        value: s._sum.estimatedValue || 0
      })),
      opportunitiesCreated,
      closedWon: totalClosed,
      winRate: Math.round(overallWinRate),
      avgDealSize: avgDealSize._avg.estimatedValue || 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/projects', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const where = {
      createdAt: { gte: start, lte: end }
    };

    const [
      totalProjects,
      projectsByStatus,
      projectsByHealth,
      avgCompletion,
      onTimeDelivery
    ] = await Promise.all([
      db.project.count({ where }),
      db.project.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      }),
      db.project.groupBy({
        by: ['healthStatus'],
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        _count: { id: true }
      }),
      db.project.aggregate({
        where,
        _avg: { completionPercentage: true }
      }),
      db.project.count({
        where: { ...where, status: 'COMPLETED' }
      })
    ]);

    res.json({
      totalProjects,
      projectsByStatus: projectsByStatus.map(s => ({
        status: s.status,
        count: s._count.id
      })),
      projectsByHealth: projectsByHealth.map(s => ({
        health: s.healthStatus,
        count: s._count.id
      })),
      avgCompletion: Math.round(avgCompletion._avg.completionPercentage || 0),
      onTimeDelivery
    });
  } catch (error) {
    next(error);
  }
});

router.get('/clients', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const where = {
      createdAt: { gte: start, lte: end }
    };

    const [
      totalClients,
      clientsByIndustry,
      clientsByStage,
      avgHealthScore,
      npsScores
    ] = await Promise.all([
      db.client.count({ where }),
      db.client.groupBy({
        by: ['industry'],
        where,
        _count: { id: true }
      }),
      db.client.groupBy({
        by: ['lifecycleStage'],
        where,
        _count: { id: true }
      }),
      db.client.aggregate({
        where,
        _avg: { healthScore: true }
      }),
      db.feedback.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { rating: true }
      })
    ]);

    const avgNps = npsScores.length > 0
      ? npsScores.reduce((sum, f) => sum + f.rating, 0) / npsScores.length
      : 0;

    res.json({
      totalClients,
      clientsByIndustry: clientsByIndustry.filter(c => c.industry).map(c => ({
        industry: c.industry,
        count: c._count.id
      })),
      clientsByStage: clientsByStage.map(c => ({
        stage: c.lifecycleStage,
        count: c._count.id
      })),
      avgHealthScore: Math.round(avgHealthScore._avg.healthScore || 0),
      avgNps: Math.round(avgNps)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const activitiesByType = await db.activity.groupBy({
      by: ['type'],
      where: { createdAt: { gte: start, lte: end } },
      _count: { id: true }
    });

    const activitiesByUser = await db.activity.groupBy({
      by: ['ownerId'],
      where: { createdAt: { gte: start, lte: end } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const users = await db.user.findMany({
      where: { id: { in: activitiesByUser.map(a => a.ownerId) } },
      select: { id: true, firstName: true, lastName: true }
    });

    res.json({
      activitiesByType: activitiesByType.map(a => ({
        type: a.type,
        count: a._count.id
      })),
      activitiesByUser: activitiesByUser.map(a => ({
        user: users.find(u => u.id === a.ownerId),
        count: a._count.id
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      openOpportunities,
      activeProjects,
      openTickets,
      upcomingMilestones
    ] = await Promise.all([
      db.opportunity.count({ where: { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } } }),
      db.project.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      db.ticket.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      db.projectMilestone.count({
        where: {
          status: { not: 'COMPLETED' },
          plannedEndDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    res.json({
      openOpportunities,
      activeProjects,
      openTickets,
      upcomingMilestones
    });
  } catch (error) {
    next(error);
  }
});

export default router;
