import { Pool } from 'pg';

// 創建數據庫連接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'casino',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password',
  max: 20, // 最大連接數
  idleTimeoutMillis: 30000, // 空閒連接超時時間
  connectionTimeoutMillis: 2000, // 連接超時時間
});

// 測試數據庫連接
const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected successfully');
    client.release();
    
    // 初始化數據庫表
    await initDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// 初始化數據庫表
const initDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    
    // 創建用戶表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 1000.00,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 創建遊戲表
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        min_bet DECIMAL(10, 2) DEFAULT 1.00,
        max_bet DECIMAL(10, 2) DEFAULT 1000.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 創建交易記錄表
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('bet', 'win', 'deposit', 'withdrawal', 'bonus')),
        amount DECIMAL(15, 2) NOT NULL,
        game_type VARCHAR(50),
        description TEXT,
        balance_before DECIMAL(15, 2),
        balance_after DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 創建索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)');

    console.log('Database tables initialized successfully');
    client.release();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export { pool, connectDB, initDatabase };