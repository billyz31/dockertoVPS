import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Transaction from '../models/Transaction';

// 獲取所有用戶列表
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const result = await User.findAllUsers(
      Number(page),
      Number(limit),
      search as string
    );

    res.json({
      users: result.users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: result.totalPages
      }
    });

  } catch (error) {
    console.error('獲取用戶列表錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
};

// 獲取用戶詳情
export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findUserById(Number(id));
    if (!user) {
      res.status(404).json({ message: '用戶不存在' });
      return;
    }

    // 獲取用戶交易記錄
    const transactionsResult = await Transaction.findTransactionsByUserId(
      Number(id),
      1,
      50
    );

    res.json({
      user,
      transactions: transactionsResult.transactions
    });

  } catch (error) {
    console.error('獲取用戶詳情錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
};

// 更新用戶信息
export const updateUser = [
  body('balance').optional().isFloat({ min: 0 }).withMessage('餘額不能為負數'),
  body('is_active').optional().isBoolean().withMessage('激活狀態必須為布林值'),

  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { balance, is_active, role } = req.body;

      const user = await User.findUserById(Number(id));
      if (!user) {
        res.status(404).json({ message: '用戶不存在' });
        return;
      }

      // 記錄餘額變更
      if (balance !== undefined && balance !== user.balance) {
        await Transaction.createTransaction({
          user_id: Number(id),
          type: 'bonus',
          amount: Math.abs(balance - user.balance),
          description: `管理員調整餘額: ${user.balance} → ${balance}`,
          balance_before: user.balance,
          balance_after: balance
        });
      }

      // 更新用戶信息
      const updateData: any = {};
      if (balance !== undefined) updateData.balance = balance;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (role !== undefined) updateData.role = role;

      const updatedUser = await User.updateUser(Number(id), updateData);

      res.json({ 
        message: '用戶信息更新成功',
        user: updatedUser
      });

    } catch (error) {
      console.error('更新用戶錯誤:', error);
      res.status(500).json({ message: '服務器錯誤' });
    }
  }
];

// 刪除用戶
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findUserById(Number(id));
    if (!user) {
      res.status(404).json({ message: '用戶不存在' });
      return;
    }

    const deleted = await User.deleteUser(Number(id));
    if (!deleted) {
      res.status(500).json({ message: '刪除用戶失敗' });
      return;
    }

    // 注意：在PostgreSQL中，我們通常使用外鍵約束來處理關聯數據的刪除
    // 這裡我們不手動刪除交易記錄，因為數據庫應該有級聯刪除設置

    res.json({ message: '用戶刪除成功' });

  } catch (error) {
    console.error('刪除用戶錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
};

// 獲取系統統計信息
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 獲取用戶統計
    const usersResult = await User.findAllUsers(1, 10000);
    const totalUsers = usersResult.total;
    
    // 計算活躍用戶（這裡簡單假設所有用戶都是活躍的）
    const activeUsers = totalUsers;
    
    // 計算總餘額
    let totalBalance = 0;
    usersResult.users.forEach(user => {
      totalBalance += user.balance;
    });
    
    // 獲取今日交易統計
    const todayStats = await Transaction.getSystemTodayStats();

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: 0, // 簡化處理
      totalBalance,
      todayTransactions: todayStats.transaction_count,
      totalTransactions: todayStats.transaction_count // 簡化處理
    });

  } catch (error) {
    console.error('獲取系統統計錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
};

// 獲取交易記錄
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, type, userId } = req.query;
    
    const result = await Transaction.findAllTransactions(
      Number(page),
      Number(limit),
      type as string,
      userId ? Number(userId) : undefined
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
    console.error('獲取交易記錄錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
};