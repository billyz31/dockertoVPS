import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: '訪問被拒絕，請提供有效的token' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    const user = await User.findUserById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: '用戶不存在' });
      return;
    }

    if (!user.is_active) {
      res.status(401).json({ message: '帳號已被停用' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '無效的token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: '需要管理員權限' });
    return;
  }
  next();
};