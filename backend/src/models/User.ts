import { pool } from '../config/database';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  balance: number;
  role: 'user' | 'admin';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

// 創建用戶
const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  balance?: number;
  role?: 'user' | 'admin';
}): Promise<IUser> => {
  const { username, email, password, balance = 1000, role = 'user' } = userData;
  
  const query = `
    INSERT INTO users (username, email, password, balance, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const values = [username, email, password, balance, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// 根據ID查找用戶
const findUserById = async (id: number): Promise<IUser | null> => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// 根據電子郵件查找用戶
const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

// 根據用戶名查找用戶
const findUserByUsername = async (username: string): Promise<IUser | null> => {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0] || null;
};

// 更新用戶
const updateUser = async (id: number, updateData: Partial<IUser>): Promise<IUser | null> => {
  const fields = Object.keys(updateData);
  if (fields.length === 0) return null;
  
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
  
  const values = [id, ...fields.map(field => updateData[field as keyof IUser])];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// 更新用戶餘額
const updateUserBalance = async (id: number, newBalance: number): Promise<IUser | null> => {
  const query = 'UPDATE users SET balance = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id, newBalance]);
  return result.rows[0] || null;
};

// 獲取所有用戶（支持分頁）
const findAllUsers = async (page: number = 1, limit: number = 10, search?: string): Promise<{
  users: IUser[];
  total: number;
  totalPages: number;
}> => {
  let whereClause = '';
  let values: any[] = [];
  
  if (search) {
    whereClause = 'WHERE username ILIKE $1 OR email ILIKE $1';
    values = [`%${search}%`];
  }
  
  // 獲取總數
  const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);
  
  // 獲取用戶數據
  const offset = (page - 1) * limit;
  const userQuery = `
    SELECT * FROM users 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  
  const userValues = [...values, limit, offset];
  const userResult = await pool.query(userQuery, userValues);
  
  return {
    users: userResult.rows,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

// 刪除用戶
const deleteUser = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return (result.rowCount || 0) > 0;
};

export default {
  createUser,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  updateUser,
  updateUserBalance,
  findAllUsers,
  deleteUser
};