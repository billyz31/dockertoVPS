import { pool } from '../config/database';

export interface ITransaction {
  id: number;
  user_id: number;
  type: 'bet' | 'win' | 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  game_type?: string;
  description: string;
  balance_before: number;
  balance_after: number;
  created_at: Date;
}

// 創建交易記錄
const createTransaction = async (transactionData: {
  user_id: number;
  type: 'bet' | 'win' | 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  game_type?: string;
  description: string;
  balance_before: number;
  balance_after: number;
}): Promise<ITransaction> => {
  const { user_id, type, amount, game_type, description, balance_before, balance_after } = transactionData;
  
  const query = `
    INSERT INTO transactions (user_id, type, amount, game_type, description, balance_before, balance_after)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [user_id, type, amount, game_type, description, balance_before, balance_after];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// 根據用戶ID獲取交易記錄
const findTransactionsByUserId = async (
  user_id: number, 
  page: number = 1, 
  limit: number = 10,
  type?: string
): Promise<{
  transactions: ITransaction[];
  total: number;
  totalPages: number;
}> => {
  let whereClause = 'WHERE user_id = $1';
  let values: any[] = [user_id];
  
  if (type) {
    whereClause += ' AND type = $2';
    values.push(type);
  }
  
  // 獲取總數
  const countQuery = `SELECT COUNT(*) FROM transactions ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);
  
  // 獲取交易數據
  const offset = (page - 1) * limit;
  const transactionQuery = `
    SELECT * FROM transactions 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  
  const transactionValues = [...values, limit, offset];
  const transactionResult = await pool.query(transactionQuery, transactionValues);
  
  return {
    transactions: transactionResult.rows,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

// 獲取所有交易記錄（支持分頁和篩選）
const findAllTransactions = async (
  page: number = 1, 
  limit: number = 10,
  type?: string,
  user_id?: number
): Promise<{
  transactions: ITransaction[];
  total: number;
  totalPages: number;
}> => {
  let whereClause = '';
  let values: any[] = [];
  let paramCount = 0;
  
  if (type || user_id) {
    const conditions = [];
    
    if (type) {
      paramCount++;
      conditions.push(`type = $${paramCount}`);
      values.push(type);
    }
    
    if (user_id) {
      paramCount++;
      conditions.push(`user_id = $${paramCount}`);
      values.push(user_id);
    }
    
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }
  
  // 獲取總數
  const countQuery = `SELECT COUNT(*) FROM transactions ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);
  
  // 獲取交易數據
  const offset = (page - 1) * limit;
  const transactionQuery = `
    SELECT t.*, u.username, u.email 
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    ${whereClause}
    ORDER BY t.created_at DESC 
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  
  const transactionValues = [...values, limit, offset];
  const transactionResult = await pool.query(transactionQuery, transactionValues);
  
  return {
    transactions: transactionResult.rows,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

// 獲取用戶今日交易總額
const getTodayTransactionsTotal = async (user_id: number): Promise<number> => {
  const query = `
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions 
    WHERE user_id = $1 
    AND DATE(created_at) = CURRENT_DATE
    AND type IN ('bet', 'win')
  `;
  
  const result = await pool.query(query, [user_id]);
  return parseFloat(result.rows[0].total);
};

// 獲取系統今日交易統計
const getSystemTodayStats = async (): Promise<{
  total_bets: number;
  total_wins: number;
  transaction_count: number;
}> => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'bet' THEN amount ELSE 0 END), 0) as total_bets,
      COALESCE(SUM(CASE WHEN type = 'win' THEN amount ELSE 0 END), 0) as total_wins,
      COUNT(*) as transaction_count
    FROM transactions 
    WHERE DATE(created_at) = CURRENT_DATE
  `;
  
  const result = await pool.query(query);
  return {
    total_bets: parseFloat(result.rows[0].total_bets),
    total_wins: parseFloat(result.rows[0].total_wins),
    transaction_count: parseInt(result.rows[0].transaction_count)
  };
};

export default {
  createTransaction,
  findTransactionsByUserId,
  findAllTransactions,
  getTodayTransactionsTotal,
  getSystemTodayStats
};