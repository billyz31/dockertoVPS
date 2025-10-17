import express from 'express';
import { playSlotMachine, getGameHistory } from '../controllers/gameController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 玩拉霸機遊戲
router.post('/slots/play', authenticate, playSlotMachine);

// 獲取遊戲記錄
router.get('/history', authenticate, getGameHistory);

export default router;