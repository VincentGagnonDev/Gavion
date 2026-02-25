import { Router, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/seed-kimi', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kimiProducts = [
      {
        name: 'Kimi - AI Receptionist',
        category: 'AI Receptionist',
        description: 'AI-powered phone receptionist that answers calls, schedules appointments, and handles patient inquiries 24/7',
        tagline: 'Your virtual receptionist never sleeps',
        longDescription: 'Kimi is an intelligent AI receptionist designed specifically for dental practices. She answers incoming calls, schedules appointments, handles common questions, and seamlessly transfers calls when needed. Available 24/7, 365 days a year.',
        targetIndustries: ['Dental', 'Healthcare', 'Professional Services'],
        targetFunctions: ['Phone Answering', 'Appointment Scheduling', 'Patient Communication', 'Lead Qualification'],
        technicalRequirements: ['Phone System Integration', 'Calendar Integration (Google/Outlook)', 'CRM Integration'],
        integrationPoints: ['Google Calendar', 'Microsoft Outlook', 'Twilio', 'Existing CRM'],
        pricingModels: ['Monthly Subscription', 'Annual Subscription'],
        typicalTimelineWeeks: 2,
        useCases: [
          'Answering common questions about services, hours, and pricing',
          'Scheduling and rescheduling appointments',
          'Taking messages and routing urgent calls',
          'Confirming appointments and sending reminders',
          'Handling after-hours calls professionally',
          'Qualifying new patient inquiries'
        ],
        displayOrder: 1
      },
      {
        name: 'Kimi - AI Chatbot',
        category: 'AI Chatbot',
        description: 'Intelligent website chatbot that engages visitors, answers questions, and converts leads',
        tagline: 'Convert website visitors into patients',
        longDescription: 'An AI-powered chatbot that lives on your website and engages with visitors in real-time. Kimi Chatbot can answer questions, book consultations, qualify leads, and provide 24/7 support to potential patients.',
        targetIndustries: ['Dental', 'Healthcare', 'Professional Services'],
        targetFunctions: ['Lead Generation', 'Customer Support', 'Appointment Booking', 'FAQ Automation'],
        technicalRequirements: ['Website Integration', 'Chat Widget', 'CRM Integration'],
        integrationPoints: ['WordPress', 'Wix', 'SquareSpace', 'Custom Website', 'Existing CRM'],
        pricingModels: ['Monthly Subscription', 'Annual Subscription'],
        typicalTimelineWeeks: 1,
        useCases: [
          'Answering visitor questions about services and pricing',
          'Booking consultation appointments',
          'Qualifying leads before passing to staff',
          'Providing after-hours support',
          'Collecting patient information for new accounts',
          'Sending follow-up messages to leads'
        ],
        displayOrder: 2
      },
      {
        name: 'Kimi - Patient Engagement',
        category: 'Patient Engagement',
        description: 'Automated patient communication system for recalls, reminders, and follow-ups',
        tagline: 'Keep your patients engaged and coming back',
        longDescription: 'An AI-powered patient engagement platform that automates recall messages, appointment reminders, and follow-up communications. Kimi helps maintain patient relationships and reduces no-shows.',
        targetIndustries: ['Dental', 'Healthcare'],
        targetFunctions: ['Patient Recall', 'Appointment Reminders', 'Follow-up Communications', 'Review Requests'],
        technicalRequirements: ['Email Integration', 'SMS Integration', 'Practice Management System'],
        integrationPoints: ['Email Providers', 'Twilio (SMS)', 'Practice Management Software'],
        pricingModels: ['Monthly Subscription', 'Annual Subscription'],
        typicalTimelineWeeks: 1,
        useCases: [
          'Sending automated recall messages for hygiene appointments',
          'Appointment reminder sequences',
          'Post-treatment follow-ups',
          'Review and referral requests',
          'Re-engaging inactive patients',
          'Birthday and holiday greetings'
        ],
        displayOrder: 3
      }
    ];

    const results = [];
    for (const product of kimiProducts) {
      const existing = await db.aISolution.findFirst({ where: { name: product.name } });
      if (!existing) {
        const created = await db.aISolution.create({ data: product });
        results.push(created);
      } else {
        results.push({ ...existing, status: 'already_existed' });
      }
    }

    res.json({ 
      message: 'Kimi products seeded successfully', 
      products: results 
    });
  } catch (error) {
    next(error);
  }
});

router.post('/assign-to-client', authorize('SYSTEM_ADMIN', 'SALES_DIRECTOR'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { clientId, solutionIds, status = 'ACTIVE' } = req.body;

    if (!clientId || !solutionIds || !Array.isArray(solutionIds)) {
      return res.status(400).json({ error: 'clientId and solutionIds array are required' });
    }

    const results = [];
    for (const solutionId of solutionIds) {
      const existing = await db.clientSolution.findUnique({
        where: {
          clientId_solutionId: {
            clientId,
            solutionId
          }
        }
      });

      if (existing) {
        results.push({ solutionId, status: 'already_exists' });
      } else {
        const created = await db.clientSolution.create({
          data: {
            clientId,
            solutionId,
            status,
            deployedAt: status === 'ACTIVE' ? new Date() : null
          }
        });
        results.push(created);
      }
    }

    res.json({ message: 'Solutions assigned to client', results });
  } catch (error) {
    next(error);
  }
});

export default router;
