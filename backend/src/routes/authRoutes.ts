import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 用戶註冊
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用戶名必須在3-20個字符之間')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用戶名只能包含字母、數字和下劃線'),
  body('email')
    .isEmail()
    .withMessage('請提供有效的郵箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密碼至少需要6個字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密碼必須包含大小寫字母和數字')
], register);

// 用戶登錄
router.post('/login', [
  body('email').isEmail().withMessage('請提供有效的郵箱地址'),
  body('password').notEmpty().withMessage('密碼不能為空')
], login);

// 獲取當前用戶信息
router.get('/me', authenticate, getMe);

export default router;