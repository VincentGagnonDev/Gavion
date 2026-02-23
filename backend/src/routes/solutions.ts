import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const solutions = await db.aISolution.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        modules: true
      }
    });
    res.json(solutions);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req: AuthRequest, res: Response) => {
  const categories = [
    { id: 'automation', name: 'Intelligent Automation', description: 'Process automation with AI capabilities' },
    { id: 'predictive', name: 'Predictive Analytics', description: 'Forecasting and prediction models' },
    { id: 'analytics', name: 'Data Analytics', description: 'Business intelligence and insights' },
    { id: 'nlp', name: 'Natural Language Processing', description: 'Text and language AI solutions' },
    { id: 'vision', name: 'Computer Vision', description: 'Image and video analysis' },
    { id: 'custom', name: 'Custom AI Models', description: 'Bespoke ML solutions' },
    { id: 'consulting', name: 'AI Consulting', description: 'Strategy and implementation planning' }
  ];
  res.json(categories);
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const solution = await db.aISolution.findUnique({
      where: { id: req.params.id },
      include: { modules: true }
    });
    if (!solution) return res.status(404).json({ error: 'Solution not found' });
    res.json(solution);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, category, description, tagline, longDescription, targetIndustries,
      targetFunctions, technicalRequirements, integrationPoints, pricingModels,
      typicalTimelineWeeks, useCases, displayOrder } = req.body;

    const solution = await db.aISolution.create({
      data: {
        name, category, description, tagline, longDescription,
        targetIndustries: targetIndustries || [],
        targetFunctions: targetFunctions || [],
        technicalRequirements: technicalRequirements || [],
        integrationPoints: integrationPoints || [],
        pricingModels: pricingModels || [],
        typicalTimelineWeeks,
        useCases: useCases || [],
        displayOrder: displayOrder || 0
      }
    });

    res.status(201).json(solution);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, category, description, tagline, longDescription, targetIndustries,
      targetFunctions, technicalRequirements, integrationPoints, pricingModels,
      typicalTimelineWeeks, useCases, isActive, displayOrder } = req.body;

    const solution = await db.aISolution.update({
      where: { id: req.params.id },
      data: {
        name, category, description, tagline, longDescription,
        targetIndustries, targetFunctions, technicalRequirements,
        integrationPoints, pricingModels, typicalTimelineWeeks,
        useCases, isActive, displayOrder
      }
    });

    res.json(solution);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/modules', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, basePrice, isOptional } = req.body;

    const module = await db.aISolutionModule.create({
      data: {
        solutionId: req.params.id,
        name, description, basePrice: basePrice || 0, isOptional: isOptional || false
      }
    });

    res.status(201).json(module);
  } catch (error) {
    next(error);
  }
});

router.post('/quotes', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { solutionId, clientId, scope, timelineWeeks, requestedBy } = req.body;

    const quoteCount = await db.quote.count();
    const quoteNumber = `QT-${String(quoteCount + 1).padStart(6, '0')}`;

    const quote = await db.quote.create({
      data: {
        solutionId, clientId, quoteNumber, scope, timelineWeeks,
        requestedBy, status: 'PENDING', requestedAt: new Date()
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
});

router.get('/quotes', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, clientId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const quotes = await db.quote.findMany({
      where,
      include: {
        solution: true,
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(quotes);
  } catch (error) {
    next(error);
  }
});

export default router;
