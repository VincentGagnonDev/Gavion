import { Router, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { authenticate, authorize, AuthRequest, authorizeResource } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

let stripe: any;
let emailService: any;

function getStripe() {
  if (!stripe) {
    stripe = require('../services/stripe');
  }
  return stripe;
}

function getEmailService() {
  if (!emailService) {
    emailService = require('../services/email');
  }
  return emailService;
}

const router = Router();

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `INV-${year}-${timestamp}`;
}

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `RCP-${timestamp}`;
}

function calculateTaxes(subtotal: number, taxRate: number = 0.14975) {
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  const taxAmount = tps + tvq;
  const total = subtotal + taxAmount;
  return { tps, tvq, taxAmount, total };
}

const validateInvoiceId = param('id').isUUID();

const validateInvoiceCreate = [
  body('clientId').isUUID().withMessage('Valid client ID required'),
  body('dueDate').optional().isISO8601(),
  body('taxRate').optional().isFloat({ min: 0, max: 1 }),
  body('notes').optional().trim(),
];

const validateInvoiceUpdate = [
  validateInvoiceId,
  body('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
  body('dueDate').optional().isISO8601(),
  body('notes').optional().trim(),
];

const validatePaymentCreate = [
  body('invoiceId').isUUID().withMessage('Valid invoice ID required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  body('method').optional().isIn(['CARD', 'BANK_TRANSFER', 'CASH', 'CHECK']),
  body('paymentDate').optional().isISO8601(),
];

const validateSubscriptionCreate = [
  body('clientId').isUUID().withMessage('Valid client ID required'),
  body('planId').trim().notEmpty().withMessage('Plan ID is required'),
  body('billingCycle').optional().isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  body('startDate').optional().isISO8601(),
];

router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { clientId, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, email: true } }
        }
      }),
      db.invoice.count({ where })
    ]);

    res.json({
      invoices,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions', 
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { clientId, status } = req.query;

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const subscriptions = await db.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', 
  validateInvoiceId,
  authenticate,
  authorizeResource('Invoice', 'clientId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        quote: true,
        payments: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { quoteId, clientId, description, amount, dueDate, lineItems } = req.body;

    let client;
    if (clientId) {
      client = await db.client.findUnique({ where: { id: clientId } });
    } else if (quoteId) {
      const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: { client: true }
      });
      client = quote?.client;
    }

    if (!client) {
      return res.status(400).json({ error: 'Client is required' });
    }

    const subtotal = amount || (lineItems as any[])?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
    const { tps, tvq, taxAmount, total } = calculateTaxes(subtotal);

    const invoice = await db.invoice.create({
      data: {
        clientId: client.id,
        quoteId: quoteId || null,
        invoiceNumber: generateInvoiceNumber(),
        subtotal,
        tpsAmount: tps,
        tvqAmount: tvq,
        taxAmount,
        total,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        lineItems: lineItems || JSON.stringify([{ description: description || 'Services', quantity: 1, price: subtotal }]),
        status: 'DRAFT'
      },
      include: {
        client: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/send', 
  validateInvoiceId,
  authenticate,
  authorizeResource('Invoice', 'clientId'),
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { createPaymentLink } = getStripe();
    const { sendQuoteEmail } = getEmailService();
    
    const invoice = await db.invoice.update({
      where: { id: req.params.id },
      data: { status: 'SENT' },
      include: {
        client: true,
        quote: true
      }
    });

    const { paymentLink, sessionId } = await createPaymentLink({
      amount: invoice.total,
      description: invoice.description || `Invoice #${invoice.invoiceNumber}`,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email || undefined,
      invoiceNumber: invoice.invoiceNumber,
    });

    await db.invoice.update({
      where: { id: req.params.id },
      data: {
        stripePaymentLink: paymentLink,
      }
    });

    const loginUrl = process.env.APP_URL || 'http://localhost:3000';
    
    if (invoice.client.email) {
      await sendQuoteEmail({
        to: invoice.client.email,
        clientName: invoice.client.name,
        quoteNumber: invoice.invoiceNumber,
        totalPrice: invoice.total,
        loginUrl: `${loginUrl}/invoices/${invoice.id}`
      });
    }

    res.json({ message: 'Invoice sent', invoice, paymentLink });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/pay', 
  validateInvoiceId,
  authenticate,
  authorizeResource('Invoice', 'clientId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { createPaymentLink } = getStripe();
    
    const invoice = await db.invoice.findUnique({
      where: { id: req.params.id },
      include: { client: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const { paymentLink, sessionId } = await createPaymentLink({
      amount: invoice.total,
      description: invoice.description || `Invoice #${invoice.invoiceNumber}`,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email || undefined,
      invoiceNumber: invoice.invoiceNumber,
    });

    res.json({ paymentLink, sessionId });
  } catch (error) {
    next(error);
  }
});

router.post('/subscriptions', 
  authenticate,
  validateSubscriptionCreate,
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { createSubscriptionPaymentLink } = getStripe();
    
    const { clientId, planName, amount, billingCycle } = req.body;

    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(400).json({ error: 'Client not found' });
    }

    const subtotal = amount;
    const { tps, tvq, taxAmount, total } = calculateTaxes(subtotal);

    const { paymentLink, sessionId } = await createSubscriptionPaymentLink({
      amount: total,
      planName,
      clientName: client.name,
      clientEmail: client.email || undefined,
      clientId: client.id,
    });

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscription = await db.subscription.create({
      data: {
        clientId: client.id,
        planName,
        billingCycle: billingCycle || 'MONTHLY',
         amount: subtotal,
         taxAmount,
        total,
        stripePaymentLink: paymentLink,
        status: 'TRIALING',
        nextBillingDate,
      },
      include: {
        client: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({ subscription, paymentLink });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/mark-paid', 
  validateInvoiceId,
  authenticate,
  authorizeResource('Invoice', 'clientId'),
  authorize('SYSTEM_ADMIN'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await db.invoice.update({
      where: { id: req.params.id },
      data: {
        status: 'PAID',
        paidDate: new Date()
      },
      include: { client: true }
    });

    const receiptNumber = generateReceiptNumber();
    
    await db.receipt.create({
      data: {
        invoiceId: invoice.id,
        receiptNumber,
        clientName: invoice.client.name,
        clientAddress: invoice.client.address,
        clientEmail: invoice.client.email,
        subtotal: invoice.subtotal,
        tpsAmount: invoice.tpsAmount,
        tvqAmount: invoice.tvqAmount,
        total: invoice.total,
        paymentMethod: 'CREDIT_CARD',
      }
    });

    res.json({ message: 'Invoice marked as paid', invoice });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('SYSTEM_ADMIN'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.invoice.delete({ where: { id: req.params.id } });
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
