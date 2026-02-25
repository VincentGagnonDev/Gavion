import { Router, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { authenticate, AuthRequest, isClientUser } from '../middleware/auth';

const router = Router();

router.use(authenticate);

const requireClient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.clientId) {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
};

router.use(requireClient);

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const [client, invoices, subscriptions, tickets, solutions] = await Promise.all([
      db.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          website: true,
          lifecycleStage: true,
          contractStartDate: true,
          contractEndDate: true,
          healthScore: true,
          npsScore: true
        }
      }),
      db.invoice.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          status: true,
          issueDate: true,
          dueDate: true,
          stripePaymentLink: true
        }
      }),
      db.subscription.findMany({
        where: { clientId },
        select: {
          id: true,
          planName: true,
          status: true,
          total: true,
          billingCycle: true,
          nextBillingDate: true,
          stripePaymentLink: true
        }
      }),
      db.ticket.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          severity: true,
          createdAt: true
        }
      }),
      db.clientSolution.findMany({
        where: { clientId },
        include: {
          solution: {
            select: {
              id: true,
              name: true,
              category: true,
              description: true,
              tagline: true
            }
          }
        }
      })
    ]);

    const unpaidInvoices = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const totalDue = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);

    res.json({
      client,
      summary: {
        totalDue,
        unpaidCount: unpaidInvoices.length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'ACTIVE').length,
        openTickets: tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
        activeSolutions: solutions.filter(s => s.status === 'ACTIVE').length
      },
      recentInvoices: invoices,
      subscriptions,
      recentTickets: tickets,
      solutions
    });
  } catch (error) {
    next(error);
  }
});

router.get('/invoices', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const clientId = req.user!.clientId!;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { clientId };
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          description: true,
          total: true,
          status: true,
          issueDate: true,
          dueDate: true,
          paidDate: true,
          stripePaymentLink: true,
          lineItems: true
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

router.get('/invoices/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const invoice = await db.invoice.findFirst({
      where: { id: req.params.id, clientId },
      include: {
        client: { select: { id: true, name: true, email: true, address: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
            paymentMethod: true,
            receiptUrl: true
          }
        }
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

router.post('/invoices/:id/pay', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;
    const { createPaymentLink } = require('../services/stripe');

    const invoice = await db.invoice.findFirst({
      where: { id: req.params.id, clientId },
      include: { client: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice already paid' });
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

router.get('/subscriptions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const subscriptions = await db.subscription.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        planName: true,
        status: true,
        billingCycle: true,
        amount: true,
        taxAmount: true,
        total: true,
        startDate: true,
        nextBillingDate: true,
        cancelledDate: true,
        stripePaymentLink: true
      }
    });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

router.get('/solutions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const solutions = await db.clientSolution.findMany({
      where: { clientId },
      include: {
        solution: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            tagline: true,
            longDescription: true,
            useCases: true
          }
        }
      }
    });

    res.json(solutions);
  } catch (error) {
    next(error);
  }
});

router.get('/solutions/:solutionId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const solution = await db.clientSolution.findFirst({
      where: { 
        id: req.params.solutionId, 
        clientId 
      },
      include: {
        solution: true
      }
    });

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    res.json(solution);
  } catch (error) {
    next(error);
  }
});

router.get('/tickets', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const clientId = req.user!.clientId!;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { clientId };
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          description: true,
          type: true,
          severity: true,
          status: true,
          createdAt: true,
          respondedAt: true,
          resolvedAt: true,
          closedAt: true,
          assignee: { select: { firstName: true, lastName: true } }
        }
      }),
      db.ticket.count({ where })
    ]);

    res.json({
      tickets,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tickets/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const ticket = await db.ticket.findFirst({
      where: { id: req.params.id, clientId },
      include: {
        assignee: { select: { firstName: true, lastName: true, email: true } },
        comments: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post('/tickets', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;
    const { title, description, type, severity } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const ticket = await db.ticket.create({
      data: {
        clientId,
        ticketNumber,
        title,
        description,
        type: type || 'HOW_TO_QUESTION',
        severity: severity || 'MEDIUM',
        status: 'NEW'
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.post('/tickets/:id/comments', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const ticket = await db.ticket.findFirst({
      where: { id: req.params.id, clientId }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const comment = await db.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: req.user!.id,
        content,
        isInternal: false
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.get('/company', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        country: true,
        legalName: true,
        industry: true,
        lifecycleStage: true,
        contractStartDate: true,
        contractEndDate: true,
        autoRenewal: true,
        renewalNoticeDays: true,
        healthScore: true,
        npsScore: true,
        aiMaturityLevel: true,
        aiReadinessScore: true
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

router.get('/contacts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId!;

    const contacts = await db.contact.findMany({
      where: { clientId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        jobTitle: true,
        isDecisionMaker: true,
        preferredChannel: true
      }
    });

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

export default router;
