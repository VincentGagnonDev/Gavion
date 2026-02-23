import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import clientRoutes from './routes/clients';
import leadRoutes from './routes/leads';
import opportunityRoutes from './routes/opportunities';
import projectRoutes from './routes/projects';
import solutionRoutes from './routes/solutions';
import ticketRoutes from './routes/tickets';
import activityRoutes from './routes/activities';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gavion CRM API running on port ${PORT}`);
});

export default app;
