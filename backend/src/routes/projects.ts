import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { ProjectStatus, TaskStatus, MilestoneStatus } from '../../generated/prisma';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, clientId, projectManagerId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (projectManagerId) where.projectManagerId = projectManagerId;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { client: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    if (req.user?.role === 'AI_PROJECT_MANAGER') {
      where.projectManagerId = req.user.id;
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, healthScore: true } },
          projectManager: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { milestones: true, tasks: true } }
        }
      }),
      db.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = { status: { notIn: ['COMPLETED', 'CANCELLED'] } };

    if (req.user?.role === 'AI_PROJECT_MANAGER') {
      where.projectManagerId = req.user.id;
    }

    const [projects, stats] = await Promise.all([
      db.project.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } }
        },
        orderBy: { endDate: 'asc' },
        take: 10
      }),
      db.project.groupBy({
        by: ['healthStatus'],
        where,
        _count: { id: true }
      })
    ]);

    const healthCounts = stats.reduce((acc, s) => {
      acc[s.healthStatus] = s._count.id;
      return acc;
    }, {} as Record<string, number>);

    res.json({ projects, healthCounts });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await db.project.findUnique({
      where: { id: req.params.id },
      include: {
        client: { include: { contacts: { where: { isActive: true }, take: 5 } } },
        opportunity: true,
        projectManager: { select: { id: true, firstName: true, lastName: true, email: true } },
        milestones: { orderBy: { order: 'asc' } },
        tasks: { 
          where: { status: { not: 'COMPLETE' } },
          include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { dueDate: 'asc' },
          take: 20 
        },
        metrics: { orderBy: { recordedAt: 'desc' }, take: 50 }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('SYSTEM_ADMIN', 'PROJECT_DIRECTOR', 'AI_PROJECT_MANAGER'), 
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, clientId, opportunityId, solutionType, startDate, endDate, budget, projectManagerId } = req.body;

    const project = await db.project.create({
      data: {
        name, description, clientId, opportunityId, solutionType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget || 0,
        projectManagerId: projectManagerId || req.user?.id,
        status: 'NOT_STARTED'
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('SYSTEM_ADMIN', 'PROJECT_DIRECTOR', 'AI_PROJECT_MANAGER'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, startDate, endDate, budget, actualCost, 
      projectManagerId, solutionType, healthStatus, completionPercentage } = req.body;

    const project = await db.project.update({
      where: { id: req.params.id },
      data: {
        name, description, status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget, actualCost, projectManagerId, solutionType,
        healthStatus, completionPercentage
      }
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/milestones', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, phase, order, plannedStartDate, plannedEndDate, ownerId } = req.body;

    const milestone = await db.projectMilestone.create({
      data: {
        projectId: req.params.id,
        name, description, phase, order: order || 0,
        plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
        ownerId, status: 'PENDING'
      }
    });

    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/milestones/:milestoneId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, actualStartDate, actualEndDate, ownerId } = req.body;

    const milestone = await db.projectMilestone.update({
      where: { id: req.params.milestoneId },
      data: { status, actualStartDate: actualStartDate ? new Date(actualStartDate) : undefined,
        actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined, ownerId }
    });

    res.json(milestone);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/tasks', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, phase, assigneeId, parentTaskId, plannedHours, dueDate, priority } = req.body;

    const task = await db.projectTask.create({
      data: {
        projectId: req.params.id,
        title, description, phase, assigneeId, parentTaskId,
        plannedHours, dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM', status: 'NOT_STARTED'
      }
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/tasks/:taskId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, assigneeId, plannedHours, actualHours, dueDate, blockerReason } = req.body;

    const task = await db.projectTask.update({
      where: { id: req.params.taskId },
      data: {
        title, description, status, priority, assigneeId,
        plannedHours, actualHours,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        blockerReason,
        completedAt: status === 'COMPLETE' ? new Date() : undefined
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/metrics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { metricName, metricCategory, value, unit, baselineValue, targetValue } = req.body;

    const metric = await db.projectMetric.create({
      data: {
        projectId: req.params.id,
        metricName, metricCategory, value, unit, baselineValue, targetValue
      }
    });

    res.status(201).json(metric);
  } catch (error) {
    next(error);
  }
});

export default router;
