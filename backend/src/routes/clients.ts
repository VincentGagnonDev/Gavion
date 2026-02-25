import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../config/database';
import { authenticate, authorize, AuthRequest, isSalesUser, isAdmin, isProjectUser, authorizeResource } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { sendPasswordResetEmail } from '../services/email';
import { body, param, validationResult } from 'express-validator';

const router = Router();

const validateClientId = param('id').isUUID();
const validateContactId = param('contactId').isUUID();

const validateClientCreate = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail(),
  body('industry').optional().trim(),
  body('lifecycleStage').optional().isIn(['PROSPECT', 'ACTIVE_PROSPECT', 'ONBOARDING', 'IMPLEMENTATION', 'OPTIMIZATION', 'RENEWAL', 'EXPANSION', 'INACTIVE']),
  body('aiReadinessScore').optional().isInt({ min: 0, max: 100 }),
  body('healthScore').optional().isInt({ min: 0, max: 100 }),
];

const validateClientUpdate = [
  validateClientId,
  body('name').optional().trim(),
  body('email').optional().isEmail(),
  body('industry').optional().trim(),
  body('lifecycleStage').optional().isIn(['PROSPECT', 'ACTIVE_PROSPECT', 'ONBOARDING', 'IMPLEMENTATION', 'OPTIMIZATION', 'RENEWAL', 'EXPANSION', 'INACTIVE']),
  body('healthScore').optional().isInt({ min: 0, max: 100 }),
  body('npsScore').optional().isInt({ min: -100, max: 100 }),
  body('isActive').optional().isBoolean(),
];

const validateContactCreate = [
  validateClientId,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('jobTitle').optional().trim(),
];

const validateContactUpdate = [
  validateClientId,
  validateContactId,
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('influenceLevel').optional().isInt({ min: 0, max: 100 }),
  body('relationshipScore').optional().isInt({ min: 0, max: 100 }),
  body('isActive').optional().isBoolean(),
];

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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

router.get('/:id', 
  validateClientId,
  authenticate,
  authorizeResource('Client', 'accountExecutiveId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      contractStartDate, contractEndDate, autoRenewal,
      sendWelcome, contactEmail, contactFirstName, contactLastName
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

    let userCreated = null;
    let emailSent = false;

     if (sendWelcome && contactEmail) {
       const tempPassword = generatePassword();
       const passwordHash = await bcrypt.hash(tempPassword, 12);

       const existingUser = await db.user.findUnique({ where: { email: contactEmail } });
       
       if (!existingUser) {
         userCreated = await db.user.create({
           data: {
             email: contactEmail,
             passwordHash,
             firstName: contactFirstName || name.split(' ')[0],
             lastName: contactLastName || name.split(' ').slice(1).join(' ') || 'Admin',
             role: 'CLIENT_ADMIN',
             clientId: client.id
           },
           select: {
             id: true,
             email: true,
             firstName: true,
             lastName: true,
             role: true
           }
         });

         // Generate password reset token
         const resetToken = crypto.randomBytes(32).toString('hex');
         const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

         await db.passwordResetToken.create({
           data: {
             userId: userCreated.id,
             token: resetToken,
             expiresAt
           }
         });

         const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
         
         await sendPasswordResetEmail({
           to: contactEmail,
           firstName: userCreated.firstName,
           resetUrl
         });

         emailSent = true;
       }
     }

    res.status(201).json({
      ...client,
      userCreated,
      welcomeEmailSent: emailSent
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', 
  authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR', 'SALES_REPRESENTATIVE'),
  validateClientUpdate,
  authorizeResource('Client', 'accountExecutiveId'),
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
});

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

router.post('/:id/contacts', 
  authenticate,
  validateContactCreate,
  authorizeResource('Client', 'accountExecutiveId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.put('/:id/contacts/:contactId', 
  authenticate,
  validateContactUpdate,
  authorizeResource('Client', 'accountExecutiveId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.get('/:id/health', 
  validateClientId,
  authenticate,
  authorizeResource('Client', 'accountExecutiveId'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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
