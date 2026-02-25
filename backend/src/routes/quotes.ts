import { Router, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { authenticate, authorize, AuthRequest, authorizeResource } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

const validateQuoteId = param('id').isUUID();

const validateQuoteCreate = [
  body('solutionId').optional().isUUID(),
  body('clientId').optional().isUUID(),
  body('scope').optional().trim(),
  body('timelineWeeks').optional().isInt({ min: 1 }),
  body('totalPrice').optional().isFloat({ min: 0 }),
  body('validUntil').optional().isISO8601(),
  body('status').optional().isIn(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'ACCEPTED', 'EXPIRED']),
];

const validateQuoteUpdate = [
  validateQuoteId,
  body('scope').optional().trim(),
  body('timelineWeeks').optional().isInt({ min: 1 }),
  body('totalPrice').optional().isFloat({ min: 0 }),
  body('validUntil').optional().isISO8601(),
  body('status').optional().isIn(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'ACCEPTED', 'EXPIRED']),
];

router.use(authenticate);

function generateQuoteNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QT-${timestamp}-${random}`;
}

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { clientId, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          solution: { select: { id: true, name: true, category: true } },
          client: { select: { id: true, name: true } }
        }
      }),
      db.quote.count({ where })
    ]);

    res.json({
      quotes,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', 
  validateQuoteId,
  authenticate,
  authorizeResource('Quote', 'clientId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quote = await db.quote.findUnique({
      where: { id: req.params.id },
      include: {
        solution: true,
        client: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

router.post('/', 
  authenticate,
  validateQuoteCreate,
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { solutionId, clientId, scope, timelineWeeks, totalPrice, validUntil } = req.body;

    const quote = await db.quote.create({
      data: {
        solutionId,
        clientId,
        quoteNumber: generateQuoteNumber(),
        scope,
        timelineWeeks,
        totalPrice: totalPrice || 0,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status: 'DRAFT'
      },
      include: {
        solution: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  authenticate,
  validateQuoteUpdate,
  authorizeResource('Quote', 'clientId'),
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { scope, timelineWeeks, totalPrice, validUntil, status } = req.body;

    const quote = await db.quote.update({
      where: { id: req.params.id },
      data: {
        scope,
        timelineWeeks,
        totalPrice,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        ...(status && { status })
      },
      include: {
        solution: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } }
      }
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/send', 
  validateQuoteId,
  authenticate,
  authorizeResource('Quote', 'clientId'),
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quote = await db.quote.update({
      where: { id: req.params.id },
      data: { status: 'SENT' },
      include: {
        solution: true,
        client: true
      }
    });

    res.json({ message: 'Quote sent successfully', quote });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/approve', 
  validateQuoteId,
  authenticate,
  authorizeResource('Quote', 'clientId'),
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quote = await db.quote.update({
      where: { id: req.params.id },
      data: { 
        status: 'APPROVED',
        approvedBy: req.user?.id,
        approvedAt: new Date()
      } as any,
      include: {
        solution: true,
        client: true
      }
    });

    res.json({ message: 'Quote approved', quote });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', 
  validateQuoteId,
  authenticate,
  authorizeResource('Quote', 'clientId'),
  authorize('SYSTEM_ADMIN'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.quote.delete({ where: { id: req.params.id } });
    res.json({ message: 'Quote deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
