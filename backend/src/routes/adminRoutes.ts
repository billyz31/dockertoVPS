import express from 'express';
import {
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  getSystemStats,
  getTransactions
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 所有管理員路由都需要認證和管理員權限
router.use(authenticate, requireAdmin);

// 用戶管理
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 系統統計
router.get('/stats', getSystemStats);

// 交易記錄
router.get('/transactions', getTransactions);

export default router;