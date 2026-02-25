import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  clientId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  params: { [key: string]: string | undefined };
  query: { [key: string]: string | undefined };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default-secret';

    const decoded = jwt.verify(token, secret) as { userId: string };
    
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        clientId: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      clientId: user.clientId || undefined
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const isSalesUser = (req: AuthRequest): boolean => {
  return req.user?.role === 'SALES_DIRECTOR' || req.user?.role === 'SALES_REPRESENTATIVE';
};

export const isProjectUser = (req: AuthRequest): boolean => {
  return req.user?.role === 'PROJECT_DIRECTOR' || req.user?.role === 'AI_PROJECT_MANAGER';
};

export const isAdmin = (req: AuthRequest): boolean => {
  return req.user?.role === 'SYSTEM_ADMIN';
};

export const isClientUser = (req: AuthRequest): boolean => {
  return req.user?.role === 'CLIENT_USER' || req.user?.role === 'CLIENT_ADMIN';
};

export const isClientAdmin = (req: AuthRequest): boolean => {
  return req.user?.role === 'CLIENT_ADMIN';
};

export const authorizeResource = (resourceName: string, ownerIdField: string = 'ownerId', clientIdField?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID required' });
      }

      // Check if user has elevated permissions
      const elevatedRoles = ['SYSTEM_ADMIN', 'SALES_DIRECTOR', 'PROJECT_DIRECTOR'];
      if (elevatedRoles.includes(req.user?.role || '')) {
        return next();
      }

      // Fetch the resource
      const resource = await (db as any)[resourceName.toLowerCase()].findUnique({
        where: { id: resourceId },
        select: {
          id: true,
          [ownerIdField]: true,
          ...(clientIdField && { [clientIdField]: true })
        }
      });

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Check ownership
      const isOwner = resource[ownerIdField] === req.user?.id;
      
      // Check client-based access for CLIENT_USER
      let hasClientAccess = false;
      if (req.user?.role === 'CLIENT_USER' && clientIdField) {
        hasClientAccess = resource[clientIdField] === req.user?.clientId;
      }

      if (!isOwner && !hasClientAccess) {
        return res.status(403).json({ error: 'No access to this resource' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
