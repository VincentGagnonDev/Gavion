import { Router, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { authenticate, authorize, AuthRequest, isAdmin, isSalesUser } from '../../middleware/auth';
import { UserRole } from '../../generated/prisma';

const router = Router();

router.use(authenticate);

router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        client: true,
        subordinates: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, isActive, search } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        managedBy: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { firstName: 'asc' }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        managedBy: { select: { id: true, firstName: true, lastName: true } },
        subordinates: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role, managerId } = req.body;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role as UserRole,
        managerId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, role, isActive, managerId } = req.body;

    const user = await db.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, role, isActive, managerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authorize('SYSTEM_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.user.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
});

router.get('/roles/list', async (_req: AuthRequest, res: Response) => {
  res.json(Object.values(UserRole));
});

export default router;
