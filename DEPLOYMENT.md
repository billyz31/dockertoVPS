# 🎰 賭場應用 - Docker 容器部署指南

## 📋 項目概述

這是一個完整的賭場應用程序，包含：
- ✅ **PostgreSQL 數據庫** - 用戶數據和交易記錄存儲
- ✅ **Node.js 後端 API** - 提供RESTful API和業務邏輯
- ✅ **React 前端應用** - 用戶界面和交互
- ✅ **Nginx 反向代理** - 負載均衡和SSL終端

## 🚀 快速開始

### 環境要求
- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 內存
- 至少 2 CPU 核心

### 1. 克隆項目
```bash
git clone <your-repo-url>
cd fullstack-docker-app
```

### 2. 配置環境變量
```bash
# 複製環境變量模板
cp .env.production.example .env.production

# 編輯生產環境配置（重要：修改密碼和密鑰）
nano .env.production
```

### 3. 部署應用
```bash
# 運行部署腳本（自動構建和啟動）
chmod +x deploy.sh
./deploy.sh
```

或者手動部署：
```bash
# 構建並啟動所有服務
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 服務配置

### 端口映射
| 服務 | 容器端口 | 主機端口 | 用途 |
|------|----------|----------|------|
| PostgreSQL | 5432 | 5432 | 數據庫訪問 |
| Backend API | 5000 | 5000 | API調試 |
| Frontend | 80 | 80 | Web界面 |
| Nginx | 80/443 | 80/443 | HTTP/HTTPS |

### 環境變量配置

#### .env.production 重要配置項：
```env
# PostgreSQL 數據庫（必須修改）
POSTGRES_PASSWORD=your-super-secure-password-here

# JWT 密鑰（必須修改）
JWT_SECRET=your-very-long-jwt-secret-key-at-least-32-characters

# 數據庫連接
DB_PASSWORD=your-super-secure-password-here
```

## 🛡️ 安全配置

### 1. 修改默認密碼
- PostgreSQL 密碼
- JWT 密鑰
- 所有環境變量中的默認值

### 2. SSL 證書配置
1. 將SSL證書文件放入 `nginx/ssl/` 目錄
2. 證書文件命名：
   - `cert.pem` - SSL證書
   - `key.pem` - 私鑰

### 3. 防火牆配置
```bash
# 只開放必要端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

## 📊 監控和管理

### 查看服務狀態
```bash
# 查看所有容器狀態
docker-compose -f docker-compose.prod.yml ps

# 查看實時日誌
docker-compose -f docker-compose.prod.yml logs -f

# 查看資源使用情況
docker stats
```

### 備份和恢復
```bash
# 備份數據庫
docker exec casino-postgres-prod pg_dump -U app_user casino > backup.sql

# 恢復數據庫
cat backup.sql | docker exec -i casino-postgres-prod psql -U app_user casino
```

## 🔄 更新和維護

### 更新應用
```bash
# 拉取最新代碼
git pull

# 重新構建和部署
./deploy.sh
```

### 清理資源
```bash
# 停止並刪除容器
docker-compose -f docker-compose.prod.yml down

# 清理未使用的鏡像
docker image prune -a

# 清理未使用的卷
docker volume prune
```

## 🚨 故障排除

### 常見問題

1. **端口衝突**
   ```bash
   # 檢查端口占用
   netstat -tuln | grep :80
   
   # 修改docker-compose中的端口映射
   ports:
     - "8080:80"  # 將主機端口改為8080
   ```

2. **內存不足**
   ```bash
   # 增加Docker資源限制
   # Docker Desktop → Settings → Resources
   ```

3. **數據庫連接失敗**
   ```bash
   # 檢查數據庫日誌
   docker logs casino-postgres-prod
   
   # 檢查數據庫連接
   docker exec casino-postgres-prod pg_isready -U app_user -d casino
   ```

### 日誌查看
```bash
# 查看特定服務日誌
docker logs casino-backend-prod
docker logs casino-frontend-prod
docker logs casino-nginx-prod
docker logs casino-postgres-prod

# 實時跟蹤日誌
docker logs -f casino-backend-prod
```

## 📈 性能優化

### 資源限制調整
根據服務器配置調整 `docker-compose.prod.yml` 中的資源限制：

```yaml
deploy:
  resources:
    limits:
      memory: "1G"    # 增加內存限制
      cpus: "2.0"     # 增加CPU限制
```

### 數據庫優化
```sql
-- 創建索引優化查詢性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

## 📝 版本信息

- **應用版本**: 1.0.0
- **數據庫**: PostgreSQL 15
- **後端**: Node.js 18 + Express
- **前端**: React 18 + Vite
- **代理**: Nginx

## 🆘 支持

如果遇到問題：
1. 檢查日誌：`docker-compose logs`
2. 驗證環境變量配置
3. 確保端口沒有衝突
4. 檢查Docker資源限制

---

**重要安全提醒**: 在生產環境中務必修改所有默認密碼和密鑰！