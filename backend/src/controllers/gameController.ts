import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Transaction from '../models/Transaction';

// 拉霸機符號和賠率配置
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
const PAYOUTS = {
  '7️⃣7️⃣7️⃣': 100,  // 三個7
  '💎💎💎': 50,   // 三個鑽石
  '🔔🔔🔔': 20,   // 三個鈴鐺
  '🍇🍇🍇': 10,   // 三個葡萄
  '🍊🍊🍊': 5,    // 三個橙子
  '🍋🍋🍋': 3,    // 三個檸檬
  '🍒🍒🍒': 2,    // 三個櫻桃
  '🍒🍒': 1.5,    // 兩個櫻桃
  '🍒': 1.2       // 一個櫻桃
};

// 生成隨機符號
const generateRandomSymbol = (): string => {
  return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
};

// 計算賠率
const calculatePayout = (reels: string[], betAmount: number): number => {
  const result = reels.join('');
  
  // 檢查中獎組合
  for (const [pattern, multiplier] of Object.entries(PAYOUTS)) {
    if (result.includes(pattern)) {
      return betAmount * multiplier;
    }
  }
  
  return 0;
};

// 玩拉霸機遊戲
export const playSlotMachine = [
  body('betAmount')
    .isInt({ min: 1, max: 1000 })
    .withMessage('投注金額必須在1-1000之間'),

  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { betAmount } = req.body;
      const userId = (req as any).user.id;

      // 獲取用戶信息
      const user = await User.findUserById(userId);
      if (!user) {
        res.status(404).json({ message: '用戶不存在' });
        return;
      }

      // 檢查餘額是否足夠
      if (user.balance < betAmount) {
        res.status(400).json({ message: '餘額不足' });
        return;
      }

      // 生成拉霸機結果
      const reels = [
        generateRandomSymbol(),
        generateRandomSymbol(),
        generateRandomSymbol()
      ];

      // 計算獎金
      const payout = calculatePayout(reels, betAmount);
      const winAmount = payout > 0 ? payout - betAmount : -betAmount;

      // 更新用戶餘額
      const balanceBefore = parseFloat(user.balance.toString());
      const newBalance = parseFloat((balanceBefore + winAmount).toFixed(2));
      
      const updatedUser = await User.updateUserBalance(userId, newBalance);
      if (!updatedUser) {
        res.status(500).json({ message: '更新用戶餘額失敗' });
        return;
      }

      // 記錄交易
      await Transaction.createTransaction({
        user_id: userId,
        type: payout > 0 ? 'win' : 'bet',
        amount: Math.abs(winAmount),
        game_type: 'slot',
        description: payout > 0 
          ? `拉霸機贏得 ${payout} (${reels.join(' ')})` 
          : `拉霸機投注 ${betAmount} (${reels.join(' ')})`,
        balance_before: balanceBefore,
        balance_after: newBalance
      });

      res.json({
        success: true,
        reels,
        betAmount,
        payout,
        winAmount: payout > 0 ? payout : 0,
        balance: parseFloat(newBalance.toFixed(2)),
        message: payout > 0 
          ? `恭喜贏得 ${payout}！` 
          : '再接再厲！'
      });

    } catch (error) {
      console.error('拉霸機遊戲錯誤:', error);
      res.status(500).json({ message: '遊戲服務器錯誤' });
    }
  }
];

// 獲取用戶遊戲記錄
export const getGameHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await Transaction.findTransactionsByUserId(
      userId,
      Number(page),
      Number(limit),
      'slot'
    );

    res.json({
      transactions: result.transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: result.totalPages
      }
    });

  } catch (error) {
    console.error('獲取遊戲記錄錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
};