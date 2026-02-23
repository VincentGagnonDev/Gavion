import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const salesPassword = await bcrypt.hash('sales123', 12);
  const projectPassword = await bcrypt.hash('project123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gavion.ai' },
    update: {},
    create: {
      email: 'admin@gavion.ai',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'SYSTEM_ADMIN'
    }
  });

  const salesDir = await prisma.user.upsert({
    where: { email: 'sarah.chen@gavion.ai' },
    update: {},
    create: {
      email: 'sarah.chen@gavion.ai',
      passwordHash: salesPassword,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'SALES_DIRECTOR',
      managerId: admin.id
    }
  });

  const salesRep = await prisma.user.upsert({
    where: { email: 'mike.johnson@gavion.ai' },
    update: {},
    create: {
      email: 'mike.johnson@gavion.ai',
      passwordHash: salesPassword,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'SALES_REPRESENTATIVE',
      managerId: salesDir.id
    }
  });

  const projectDir = await prisma.user.upsert({
    where: { email: 'emma.wilson@gavion.ai' },
    update: {},
    create: {
      email: 'emma.wilson@gavion.ai',
      passwordHash: projectPassword,
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'PROJECT_DIRECTOR',
      managerId: admin.id
    }
  });

  const projectManager = await prisma.user.upsert({
    where: { email: 'david.kim@gavion.ai' },
    update: {},
    create: {
      email: 'david.kim@gavion.ai',
      passwordHash: projectPassword,
      firstName: 'David',
      lastName: 'Kim',
      role: 'AI_PROJECT_MANAGER',
      managerId: projectDir.id
    }
  });

  const aiExpert = await prisma.user.upsert({
    where: { email: 'lisa.technology@gavion.ai' },
    update: {},
    create: {
      email: 'lisa.technology@gavion.ai',
      passwordHash: projectPassword,
      firstName: 'Lisa',
      lastName: 'Tech',
      role: 'AI_EXPERT',
      managerId: projectManager.id
    }
  });

  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'techcorp-001' },
      update: {},
      create: {
        id: 'techcorp-001',
        name: 'TechCorp Industries',
        industry: 'Technology',
        size: '501-1000',
        revenueBand: '$50M-$100M',
        city: 'San Francisco',
        country: 'USA',
        aiMaturityLevel: 'Developing',
        aiReadinessScore: 72,
        technologyStack: ['AWS', 'Azure', 'React', 'Node.js'],
        lifecycleStage: 'IMPLEMENTATION',
        healthScore: 85,
        accountExecutiveId: salesRep.id
      }
    }),
    prisma.client.upsert({
      where: { id: 'healthplus-002' },
      update: {},
      create: {
        id: 'healthplus-002',
        name: 'HealthPlus Medical',
        industry: 'Healthcare',
        size: '1001-5000',
        revenueBand: '$100M-$500M',
        city: 'Boston',
        country: 'USA',
        aiMaturityLevel: 'Beginning',
        aiReadinessScore: 45,
        technologyStack: ['Oracle', 'SAP', 'Legacy Systems'],
        lifecycleStage: 'OPTIMIZATION',
        healthScore: 92,
        accountExecutiveId: salesRep.id
      }
    }),
    prisma.client.upsert({
      where: { id: 'financeflow-003' },
      update: {},
      create: {
        id: 'financeflow-003',
        name: 'FinanceFlow Bank',
        industry: 'Financial Services',
        size: '5001-10000',
        revenueBand: '$500M-$1B',
        city: 'New York',
        country: 'USA',
        aiMaturityLevel: 'Advanced',
        aiReadinessScore: 88,
        technologyStack: ['AWS', 'Kubernetes', 'Python', 'TensorFlow'],
        lifecycleStage: 'IMPLEMENTATION',
        healthScore: 78,
        accountExecutiveId: salesRep.id
      }
    })
  ]);

  await prisma.contact.createMany({
    data: [
      {
        clientId: clients[0].id,
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@techcorp.com',
        jobTitle: 'CTO',
        isDecisionMaker: true,
        isTechnicalLead: true,
        influenceLevel: 95
      },
      {
        clientId: clients[0].id,
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@techcorp.com',
        jobTitle: 'VP of Operations',
        isDecisionMaker: false,
        isInfluencer: true,
        influenceLevel: 80
      },
      {
        clientId: clients[1].id,
        firstName: 'Robert',
        lastName: 'Smith',
        email: 'rsmith@healthplus.com',
        jobTitle: 'Director of IT',
        isDecisionMaker: false,
        isTechnicalLead: true,
        influenceLevel: 75
      },
      {
        clientId: clients[2].id,
        firstName: 'Jennifer',
        lastName: 'Lee',
        email: 'jlee@financeflow.com',
        jobTitle: 'Chief Data Officer',
        isDecisionMaker: true,
        isTechnicalLead: true,
        influenceLevel: 98
      }
    ],
    skipDuplicates: true
  });

  await prisma.lead.createMany({
    data: [
      {
        ownerId: salesRep.id,
        companyName: 'RetailMax',
        contactName: 'Tom Anderson',
        contactEmail: 'tanderson@retailmax.com',
        source: 'Website',
        industry: 'Retail',
        companySize: '201-500',
        leadScore: 65,
        scoreTier: 'Warm',
        status: 'QUALIFICATION'
      },
      {
        ownerId: salesRep.id,
        companyName: 'ManufacturingCo',
        contactName: 'Sarah Brown',
        contactEmail: 'sbrown@manufacturingco.com',
        source: 'Referral',
        industry: 'Manufacturing',
        companySize: '1001-5000',
        leadScore: 82,
        scoreTier: 'Hot',
        status: 'DISCOVERY'
      }
    ],
    skipDuplicates: true
  });

  const solutions = await Promise.all([
    prisma.aISolution.upsert({
      where: { id: 'automation-001' },
      update: {},
      create: {
        id: 'automation-001',
        name: 'Intelligent Process Automation',
        category: 'automation',
        tagline: 'Automate repetitive tasks with AI-powered bots',
        description: 'Streamline business processes with AI that learns and adapts to your workflows.',
        targetIndustries: ['Finance', 'Healthcare', 'Retail', 'Manufacturing'],
        targetFunctions: ['Operations', 'Finance', 'Customer Service'],
        technicalRequirements: ['API Access', 'Process Documentation'],
        pricingModels: ['Subscription', 'Usage-based'],
        typicalTimelineWeeks: 12,
        useCases: ['Invoice Processing', 'Customer Onboarding', 'Data Entry'],
        displayOrder: 1
      }
    }),
    prisma.aISolution.upsert({
      where: { id: 'predictive-001' },
      update: {},
      create: {
        id: 'predictive-001',
        name: 'Predictive Analytics Suite',
        category: 'predictive',
        tagline: 'Forecast trends before they happen',
        description: 'Machine learning models that predict customer behavior, demand, and risks.',
        targetIndustries: ['Retail', 'Finance', 'Healthcare'],
        targetFunctions: ['Sales', 'Marketing', 'Supply Chain'],
        technicalRequirements: ['Historical Data', 'Data Warehouse'],
        pricingModels: ['Subscription'],
        typicalTimelineWeeks: 16,
        useCases: ['Demand Forecasting', 'Churn Prediction', 'Risk Assessment'],
        displayOrder: 2
      }
    }),
    prisma.aISolution.upsert({
      where: { id: 'nlp-001' },
      update: {},
      create: {
        id: 'nlp-001',
        name: 'Natural Language Processing',
        category: 'nlp',
        tagline: 'Understand customer sentiment at scale',
        description: 'Extract insights from text data with advanced NLP models.',
        targetIndustries: ['All'],
        targetFunctions: ['Customer Service', 'Marketing', 'Support'],
        technicalRequirements: ['Text Data Sources', 'API Integration'],
        pricingModels: ['Subscription', 'Usage-based'],
        typicalTimelineWeeks: 8,
        useCases: ['Chatbots', 'Sentiment Analysis', 'Document Processing'],
        displayOrder: 3
      }
    }),
    prisma.aISolution.upsert({
      where: { id: 'vision-001' },
      update: {},
      create: {
        id: 'vision-001',
        name: 'Computer Vision Solutions',
        category: 'vision',
        tagline: 'See and understand visual data',
        description: 'Image and video analysis for quality control, security, and automation.',
        targetIndustries: ['Manufacturing', 'Retail', 'Healthcare'],
        targetFunctions: ['Quality Assurance', 'Security', 'Operations'],
        technicalRequirements: ['Camera Systems', 'Edge Computing'],
        pricingModels: ['Subscription', 'Project-based'],
        typicalTimelineWeeks: 20,
        useCases: ['Quality Inspection', 'Facial Recognition', 'Object Detection'],
        displayOrder: 4
      }
    })
  ]);

  console.log('Database seeded successfully!');
  console.log('Default users:');
  console.log('  admin@gavion.ai / admin123');
  console.log('  sarah.chen@gavion.ai / sales123');
  console.log('  mike.johnson@gavion.ai / sales123');
  console.log('  emma.wilson@gavion.ai / project123');
  console.log('  david.kim@gavion.ai / project123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
