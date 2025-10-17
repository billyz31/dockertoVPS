import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';

// 生成JWT Token
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// 用戶註冊
export const register = [
  // 驗證輸入
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用戶名必須在3-20個字符之間')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用戶名只能包含字母、數字和下劃線'),
  
  body('email').isEmail().withMessage('請提供有效的電子郵件'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密碼至少需要6個字符'),

  async (req: Request, res: Response): Promise<void> => {
    try {
      // 檢查驗證錯誤
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { username, email, password } = req.body;

      // 檢查用戶是否已存在
      const existingUserByEmail = await User.findUserByEmail(email);
      const existingUserByUsername = await User.findUserByUsername(username);

      if (existingUserByEmail || existingUserByUsername) {
        res.status(400).json({ message: '用戶名或電子郵件已被使用' });
        return;
      }

      // 加密密碼
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 創建新用戶
      const user = await User.createUser({
        username,
        email,
        password: hashedPassword,
        balance: 1000 // 初始金額
      });

      // 生成token
      const token = generateToken(user.id);

      res.status(201).json({
        message: '註冊成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: parseFloat(user.balance.toString()),
          role: user.role
        }
      });
    } catch (error) {
      console.error('註冊錯誤:', error);
      res.status(500).json({ message: '伺服器錯誤' });
    }
  }
];

// 用戶登錄
export const login = [
  body('email').isEmail().withMessage('請提供有效的電子郵件'),
  body('password').notEmpty().withMessage('請輸入密碼'),

  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // 查找用戶
      const user = await User.findUserByEmail(email);
      if (!user) {
        res.status(401).json({ message: '電子郵件或密碼錯誤' });
        return;
      }

      // 驗證密碼
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: '電子郵件或密碼錯誤' });
        return;
      }

      // 檢查帳號狀態
      if (!user.is_active) {
        res.status(401).json({ message: '帳號已被停用' });
        return;
      }

      // 更新最後登錄時間
      await User.updateUser(user.id, { last_login: new Date() });

      // 生成token
      const token = generateToken(user.id);

      res.json({
        message: '登錄成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: parseFloat(user.balance.toString()),
          role: user.role
        }
      });
    } catch (error) {
      console.error('登錄錯誤:', error);
      res.status(500).json({ message: '伺服器錯誤' });
    }
  }
];

// 獲取當前用戶信息
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user 由auth中間件設置
    const user = (req as any).user;
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: parseFloat(user.balance.toString()),
        role: user.role,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};