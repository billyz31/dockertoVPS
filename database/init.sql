-- 初始化數據庫表結構

-- 創建用戶表
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
);

-- 創建遊戲表
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
);

-- 創建交易記錄表
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
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- 插入默認遊戲數據
INSERT INTO games (name, type, description, min_bet, max_bet) VALUES
('拉霸機', 'slot', '經典拉霸機遊戲，有機會贏得大獎', 1.00, 100.00),
('二十一點', 'blackjack', '經典二十一點遊戲，挑戰莊家', 5.00, 500.00),
('輪盤', 'roulette', '歐洲輪盤遊戲，多種投注選擇', 2.00, 200.00)
ON CONFLICT DO NOTHING;

-- 創建管理員用戶（密碼：admin123）
INSERT INTO users (username, email, password, balance, role) VALUES
('admin', 'admin@casino.com', '$2a$12$r3z7J9K8L2m1N4x5V6b7C8d9E0f1G2h3I4j5K6L7M8N9O0P1Q2R3S4T5U6V7W', 10000.00, 'admin')
ON CONFLICT DO NOTHING;