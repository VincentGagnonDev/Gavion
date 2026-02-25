import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
// import clientRoutes from './routes/clients';
import leadRoutes from './routes/leads';
import opportunityRoutes from './routes/opportunities';
import projectRoutes from './routes/projects';
import solutionRoutes from './routes/solutions';
import ticketRoutes from './routes/tickets';
import activityRoutes from './routes/activities';
import analyticsRoutes from './routes/analytics';
import quoteRoutes from './routes/quotes';
import paymentRoutes from './routes/payments';
import clientPortalRoutes from './routes/client-portal';
import kimiRoutes from './routes/kimi';

dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const { v4: uuidv4 } = require('uuid');
  (req as any).requestId = uuidv4();
  res.setHeader('X-Request-ID', (req as any).requestId);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"], // Removed unsafe-inline
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS with whitelist validation
const whitelist = (process.env.CORS_WHITELIST || 'http://localhost:3000,http://localhost:5173').split(',');
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting with per-IP+email key for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // reduced from 10
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    const email = (req.body.email || 'unknown').toString().toLowerCase();
    return `${ip}:${email}`;
  },
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter (skip health check)
app.use('/api/health', (req: Request, res: Response, next: NextFunction) => next());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(['/api'], limiter);

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/client', clientPortalRoutes);
app.use('/api/kimi', kimiRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gavion CRM API running on port ${PORT}`);
});

export default app;
