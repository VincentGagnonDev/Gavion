
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  lastName: 'lastName',
  role: 'role',
  isActive: 'isActive',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  clientId: 'clientId',
  managerId: 'managerId'
};

exports.Prisma.ClientScalarFieldEnum = {
  id: 'id',
  name: 'name',
  legalName: 'legalName',
  industry: 'industry',
  industryCode: 'industryCode',
  size: 'size',
  revenueBand: 'revenueBand',
  address: 'address',
  city: 'city',
  country: 'country',
  phone: 'phone',
  website: 'website',
  aiMaturityLevel: 'aiMaturityLevel',
  aiReadinessScore: 'aiReadinessScore',
  technologyStack: 'technologyStack',
  lifecycleStage: 'lifecycleStage',
  healthScore: 'healthScore',
  npsScore: 'npsScore',
  accountExecutiveId: 'accountExecutiveId',
  contractStartDate: 'contractStartDate',
  contractEndDate: 'contractEndDate',
  autoRenewal: 'autoRenewal',
  renewalNoticeDays: 'renewalNoticeDays',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClientSolutionScalarFieldEnum = {
  id: 'id',
  clientId: 'clientId',
  solutionId: 'solutionId',
  deployedAt: 'deployedAt',
  status: 'status'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  clientId: 'clientId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  jobTitle: 'jobTitle',
  isDecisionMaker: 'isDecisionMaker',
  isInfluencer: 'isInfluencer',
  isTechnicalLead: 'isTechnicalLead',
  isEndUser: 'isEndUser',
  isBudgetHolder: 'isBudgetHolder',
  influenceLevel: 'influenceLevel',
  relationshipScore: 'relationshipScore',
  lastInteraction: 'lastInteraction',
  preferredChannel: 'preferredChannel',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  clientId: 'clientId',
  ownerId: 'ownerId',
  source: 'source',
  sourceDetails: 'sourceDetails',
  status: 'status',
  companyName: 'companyName',
  contactName: 'contactName',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  industry: 'industry',
  companySize: 'companySize',
  leadScore: 'leadScore',
  scoreTier: 'scoreTier',
  scoreReason: 'scoreReason',
  budgetRange: 'budgetRange',
  timeline: 'timeline',
  needDescription: 'needDescription',
  convertedAt: 'convertedAt',
  lostAt: 'lostAt',
  lossReason: 'lossReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OpportunityScalarFieldEnum = {
  id: 'id',
  leadId: 'leadId',
  clientId: 'clientId',
  ownerId: 'ownerId',
  name: 'name',
  stage: 'stage',
  probability: 'probability',
  expectedCloseDate: 'expectedCloseDate',
  actualCloseDate: 'actualCloseDate',
  estimatedValue: 'estimatedValue',
  weightedValue: 'weightedValue',
  nextStep: 'nextStep',
  nextStepDate: 'nextStepDate',
  lostReason: 'lostReason',
  wonReason: 'wonReason',
  solutionType: 'solutionType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProposalScalarFieldEnum = {
  id: 'id',
  opportunityId: 'opportunityId',
  version: 'version',
  title: 'title',
  content: 'content',
  solutionDescription: 'solutionDescription',
  implementationPlan: 'implementationPlan',
  timelineWeeks: 'timelineWeeks',
  basePrice: 'basePrice',
  discount: 'discount',
  finalPrice: 'finalPrice',
  terms: 'terms',
  status: 'status',
  approvalStatus: 'approvalStatus',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  signedAt: 'signedAt',
  documentUrl: 'documentUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  opportunityId: 'opportunityId',
  clientId: 'clientId',
  name: 'name',
  description: 'description',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  actualEndDate: 'actualEndDate',
  budget: 'budget',
  actualCost: 'actualCost',
  projectManagerId: 'projectManagerId',
  solutionType: 'solutionType',
  healthStatus: 'healthStatus',
  completionPercentage: 'completionPercentage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectMilestoneScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  name: 'name',
  description: 'description',
  status: 'status',
  phase: 'phase',
  order: 'order',
  plannedStartDate: 'plannedStartDate',
  plannedEndDate: 'plannedEndDate',
  actualStartDate: 'actualStartDate',
  actualEndDate: 'actualEndDate',
  completionCriteria: 'completionCriteria',
  ownerId: 'ownerId',
  dependsOnId: 'dependsOnId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectTaskScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  phase: 'phase',
  assigneeId: 'assigneeId',
  parentTaskId: 'parentTaskId',
  plannedHours: 'plannedHours',
  actualHours: 'actualHours',
  dueDate: 'dueDate',
  completedAt: 'completedAt',
  blockerReason: 'blockerReason',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectMetricScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  metricName: 'metricName',
  metricCategory: 'metricCategory',
  value: 'value',
  unit: 'unit',
  baselineValue: 'baselineValue',
  targetValue: 'targetValue',
  recordedAt: 'recordedAt'
};

exports.Prisma.AISolutionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  description: 'description',
  tagline: 'tagline',
  longDescription: 'longDescription',
  targetIndustries: 'targetIndustries',
  targetFunctions: 'targetFunctions',
  technicalRequirements: 'technicalRequirements',
  integrationPoints: 'integrationPoints',
  pricingModels: 'pricingModels',
  typicalTimelineWeeks: 'typicalTimelineWeeks',
  useCases: 'useCases',
  caseStudies: 'caseStudies',
  isActive: 'isActive',
  displayOrder: 'displayOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AISolutionModuleScalarFieldEnum = {
  id: 'id',
  solutionId: 'solutionId',
  name: 'name',
  description: 'description',
  basePrice: 'basePrice',
  isOptional: 'isOptional'
};

exports.Prisma.QuoteScalarFieldEnum = {
  id: 'id',
  solutionId: 'solutionId',
  clientId: 'clientId',
  quoteNumber: 'quoteNumber',
  version: 'version',
  status: 'status',
  scope: 'scope',
  timelineWeeks: 'timelineWeeks',
  totalPrice: 'totalPrice',
  validUntil: 'validUntil',
  requestedBy: 'requestedBy',
  requestedAt: 'requestedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  leadId: 'leadId',
  opportunityId: 'opportunityId',
  contactId: 'contactId',
  type: 'type',
  subject: 'subject',
  description: 'description',
  scheduledAt: 'scheduledAt',
  completedAt: 'completedAt',
  durationMinutes: 'durationMinutes',
  outcome: 'outcome',
  sentiment: 'sentiment',
  keyTopics: 'keyTopics',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  clientId: 'clientId',
  projectId: 'projectId',
  milestoneId: 'milestoneId',
  type: 'type',
  rating: 'rating',
  comments: 'comments',
  deliveredOnTime: 'deliveredOnTime',
  metExpectations: 'metExpectations',
  wouldRecommend: 'wouldRecommend',
  responderName: 'responderName',
  responderEmail: 'responderEmail',
  createdAt: 'createdAt'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  clientId: 'clientId',
  assigneeId: 'assigneeId',
  ticketNumber: 'ticketNumber',
  title: 'title',
  description: 'description',
  type: 'type',
  severity: 'severity',
  status: 'status',
  resolution: 'resolution',
  rootCause: 'rootCause',
  slaResponseDue: 'slaResponseDue',
  slaResolutionDue: 'slaResolutionDue',
  respondedAt: 'respondedAt',
  resolvedAt: 'resolvedAt',
  closedAt: 'closedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TicketCommentScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  authorId: 'authorId',
  content: 'content',
  isInternal: 'isInternal',
  createdAt: 'createdAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  authorId: 'authorId',
  entityType: 'entityType',
  entityId: 'entityId',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  changes: 'changes',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  SALES_DIRECTOR: 'SALES_DIRECTOR',
  SALES_REPRESENTATIVE: 'SALES_REPRESENTATIVE',
  PROJECT_DIRECTOR: 'PROJECT_DIRECTOR',
  AI_PROJECT_MANAGER: 'AI_PROJECT_MANAGER',
  AI_EXPERT: 'AI_EXPERT',
  CLIENT_ADMIN: 'CLIENT_ADMIN',
  CLIENT_USER: 'CLIENT_USER'
};

exports.ClientLifecycleStage = exports.$Enums.ClientLifecycleStage = {
  PROSPECT: 'PROSPECT',
  ACTIVE_PROSPECT: 'ACTIVE_PROSPECT',
  ONBOARDING: 'ONBOARDING',
  IMPLEMENTATION: 'IMPLEMENTATION',
  OPTIMIZATION: 'OPTIMIZATION',
  RENEWAL: 'RENEWAL',
  EXPANSION: 'EXPANSION',
  INACTIVE: 'INACTIVE'
};

exports.LeadStatus = exports.$Enums.LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  UNQUALIFIED: 'UNQUALIFIED',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST'
};

exports.OpportunityStage = exports.$Enums.OpportunityStage = {
  LEAD_INGESTION: 'LEAD_INGESTION',
  QUALIFICATION: 'QUALIFICATION',
  DISCOVERY: 'DISCOVERY',
  SOLUTION_DESIGN: 'SOLUTION_DESIGN',
  PROPOSAL: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  CLOSED_WON: 'CLOSED_WON',
  CLOSED_LOST: 'CLOSED_LOST'
};

exports.ProjectStatus = exports.$Enums.ProjectStatus = {
  NOT_STARTED: 'NOT_STARTED',
  INITIATION: 'INITIATION',
  DISCOVERY: 'DISCOVERY',
  DESIGN: 'DESIGN',
  DEVELOPMENT: 'DEVELOPMENT',
  DEPLOYMENT: 'DEPLOYMENT',
  OPTIMIZATION: 'OPTIMIZATION',
  HANDOVER: 'HANDOVER',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED'
};

exports.MilestoneStatus = exports.$Enums.MilestoneStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
  CANCELLED: 'CANCELLED'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETE: 'COMPLETE'
};

exports.TicketType = exports.$Enums.TicketType = {
  TECHNICAL_ISSUE: 'TECHNICAL_ISSUE',
  HOW_TO_QUESTION: 'HOW_TO_QUESTION',
  ENHANCEMENT_REQUEST: 'ENHANCEMENT_REQUEST',
  BILLING_INQUIRY: 'BILLING_INQUIRY'
};

exports.TicketSeverity = exports.$Enums.TicketSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_CLIENT: 'PENDING_CLIENT',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Client: 'Client',
  ClientSolution: 'ClientSolution',
  Contact: 'Contact',
  Lead: 'Lead',
  Opportunity: 'Opportunity',
  Proposal: 'Proposal',
  Project: 'Project',
  ProjectMilestone: 'ProjectMilestone',
  ProjectTask: 'ProjectTask',
  ProjectMetric: 'ProjectMetric',
  AISolution: 'AISolution',
  AISolutionModule: 'AISolutionModule',
  Quote: 'Quote',
  Activity: 'Activity',
  Feedback: 'Feedback',
  Ticket: 'Ticket',
  TicketComment: 'TicketComment',
  Comment: 'Comment',
  AuditLog: 'AuditLog',
  RefreshToken: 'RefreshToken'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
