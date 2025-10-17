# Docker 容器 + Coolify VPS 部署完整指南

## 📋 目錄
1. [部署方案概述](#部署方案概述)
2. [前期準備工作](#前期準備工作)
3. [Docker 映像構建與推送](#docker-映像構建與推送)
4. [VPS 環境準備](#vps-環境準備)
5. [Coolify 安裝與配置](#coolify-安裝與配置)
6. [Docker 容器部署](#docker-容器部署)
7. [域名與 SSL 配置](#域名與-ssl-配置)
8. [監控與維護](#監控與維護)
9. [故障排除](#故障排除)
10. [成本分析](#成本分析)

---

## 🎯 部署方案概述

### Docker 容器部署優勢
- ✅ **部署速度快**: 預構建映像，秒級部署
- ✅ **版本控制精確**: 映像標籤確保版本一致性
- ✅ **安全性高**: 容器隔離，減少攻擊面
- ✅ **資源效率**: 優化的映像大小和資源使用
- ✅ **回滾簡單**: 快速切換映像版本
- ✅ **橫向擴展**: 輕鬆複製容器實例

### 技術架構
```
GitHub Repository → Docker Images → Docker Hub → Coolify → VPS
```

---

## 🛠️ 前期準備工作

### 1. 硬體需求
**推薦配置 (Hostinger KVM 2)**:
- CPU: 2 vCPU
- 記憶體: 4GB RAM
- 儲存: 80GB NVMe SSD
- 頻寬: 100 Mbps
- 月費: $7.99 USD

### 2. 軟體需求
- Ubuntu 22.04 LTS (推薦)
- Docker Engine 24.0+
- Docker Compose v2.20+
- Coolify v4.0+

### 3. 域名準備
準備兩個子域名:
- `app.yourdomain.com` (前端)
- `api.yourdomain.com` (後端)

### 4. GitHub 設置
- GitHub Personal Access Token (classic)
- 權限: `read:packages`, `write:packages`

---

## 🐳 Docker 映像構建與推送

### 1. 設置 Docker Hub

#### 創建 Access Token
1. 前往 Docker Hub → Account Settings → Security
2. 點擊 "New Access Token"
3. 選擇權限:
   - `Public Repo Read/Write` (公開倉庫)
   - `Private Repo Read/Write` (私有倉庫)
4. 複製生成的 token

#### 本地 Docker 登錄
```powershell
# 登錄到 Docker Hub
echo "YOUR_DOCKER_HUB_TOKEN" | docker login -u YOUR_DOCKER_HUB_USERNAME --password-stdin
```

### 2. 自動化構建腳本

使用提供的 `docker-build-and-push.ps1` 腳本:

```powershell
# 執行構建腳本
.\docker-build-and-push.ps1 -Username "your-docker-hub-username" -Repository "your-repo-name"
```

### 3. 手動構建 (可選)

#### 構建前端映像
```powershell
cd frontend
docker build -t your-username/your-repo-frontend:latest .
docker push your-username/your-repo-frontend:latest
```

#### 構建後端映像
```powershell
cd backend
docker build -t your-username/your-repo-backend:latest .
docker push your-username/your-repo-backend:latest
```

### 4. 驗證映像推送
```powershell
# 檢查映像是否成功推送
docker pull your-username/your-repo-frontend:latest
docker pull your-username/your-repo-backend:latest
```

---

## 🖥️ VPS 環境準備

### 1. 購買與設置 VPS

#### Hostinger VPS 設置
1. 前往 [Hostinger VPS](https://www.hostinger.com/vps-hosting)
2. 選擇 KVM 2 套餐
3. 選擇 Ubuntu 22.04 LTS
4. 設置 root 密碼
5. 等待 VPS 啟動

### 2. 初始系統配置

#### 連接到 VPS
```bash
ssh root@your-vps-ip
```

#### 系統更新
```bash
# 更新系統套件
apt update && apt upgrade -y

# 安裝必要工具
apt install -y curl wget git htop nano ufw
```

#### 防火墻配置
```bash
# 配置 UFW 防火墻
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp  # Coolify 管理界面
ufw --force enable
```

### 3. Docker 安裝

#### 安裝 Docker Engine
```bash
# 安裝 Docker 官方 GPG 密鑰
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 官方 APT 倉庫
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新套件列表並安裝 Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 啟動並啟用 Docker 服務
systemctl start docker
systemctl enable docker

# 驗證 Docker 安裝
docker --version
docker compose version
```

#### Docker 權限設置
```bash
# 創建 docker 用戶組並添加當前用戶
groupadd docker
usermod -aG docker $USER

# 重新登錄以應用權限變更
newgrp docker
```

---

## 🚀 Coolify 安裝與配置

### 1. 安裝 Coolify

#### 一鍵安裝腳本
```bash
# 下載並執行 Coolify 安裝腳本
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

#### 驗證安裝
```bash
# 檢查 Coolify 服務狀態
docker ps | grep coolify

# 檢查 Coolify 日誌
docker logs coolify
```

### 2. 初始配置

#### 訪問 Coolify 管理界面
1. 打開瀏覽器，訪問 `http://your-vps-ip:8000`
2. 創建管理員帳戶
3. 完成初始設置嚮導

#### 配置 Docker Hub
1. 前往 Settings → Registries
2. 添加新的 Registry:
   - Type: Docker Hub
   - URL: `docker.io`
   - Username: 你的 Docker Hub 用戶名
   - Password: 你的 Docker Hub Access Token

---

## 📦 Docker 容器部署

### 1. 創建新項目

#### 在 Coolify 中創建項目
1. 點擊 "New Project"
2. 項目名稱: `fullstack-casino-docker`
3. 描述: `Full-stack casino application with Docker containers`

### 2. 環境變數配置

#### 複製環境變數範例
```bash
# 在本地複製環境變數文件
cp .env.docker.example .env.docker
```

#### 編輯環境變數
編輯 `.env.docker` 文件，填入實際值:

```env
# Docker 映像配置
FRONTEND_IMAGE=your-username/your-repo-frontend:latest
BACKEND_IMAGE=your-username/your-repo-backend:latest

# Docker Hub 認證
DOCKER_HUB_USERNAME=your-docker-hub-username
DOCKER_HUB_TOKEN=your_docker_hub_access_token
```
# 資料庫配置
POSTGRES_PASSWORD=your_very_secure_database_password

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key_must_be_at_least_32_characters_long

# 域名配置
FRONTEND_DOMAIN=app.yourdomain.com
BACKEND_DOMAIN=api.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# 其他配置...
```

### 3. 部署 Docker Compose 堆疊

#### 上傳配置文件
1. 在 Coolify 項目中點擊 "New Resource"
2. 選擇 "Docker Compose"
3. 上傳 `coolify-docker-deploy.yml` 文件
4. 設置環境變數 (從 `.env.docker` 複製)

#### 配置服務域名
為每個服務配置域名:

**PostgreSQL 資料庫**:
- 內部服務，無需外部域名

**後端 API**:
- 域名: `api.yourdomain.com`
- 端口: 5000
- 啟用 SSL: 是

**前端應用**:
- 域名: `app.yourdomain.com`
- 端口: 80
- 啟用 SSL: 是

### 4. 啟動部署

#### 部署順序
1. 首先部署 PostgreSQL 資料庫
2. 等待資料庫啟動完成
3. 部署後端 API 服務
4. 最後部署前端應用

#### 監控部署進度
```bash
# 查看容器狀態
docker ps

# 查看服務日誌
docker logs container-name

# 查看 Coolify 日誌
docker logs coolify
```

---

## 🌐 域名與 SSL 配置

### 1. DNS 配置

#### 設置 A 記錄
在你的域名提供商處添加 DNS 記錄:

```
Type: A
Name: app
Value: your-vps-ip
TTL: 300

Type: A
Name: api
Value: your-vps-ip
TTL: 300
```

#### 驗證 DNS 解析
```bash
# 檢查 DNS 解析
nslookup app.yourdomain.com
nslookup api.yourdomain.com
```

### 2. SSL 證書配置

#### Let's Encrypt 自動配置
Coolify 會自動為配置的域名申請 Let's Encrypt SSL 證書:

1. 確保域名正確解析到 VPS IP
2. 在 Coolify 服務配置中啟用 SSL
3. 等待證書自動申請和配置

#### 驗證 SSL 證書
```bash
# 檢查 SSL 證書
curl -I https://app.yourdomain.com
curl -I https://api.yourdomain.com
```

---

## 📊 監控與維護

### 1. 健康檢查

#### 服務健康狀態
```bash
# 檢查前端健康狀態
curl -f https://app.yourdomain.com/health || echo "Frontend unhealthy"

# 檢查後端健康狀態
curl -f https://api.yourdomain.com/api/health || echo "Backend unhealthy"

# 檢查資料庫連接
docker exec postgres-container pg_isready -U postgres
```

#### Coolify 監控面板
1. 訪問 Coolify 管理界面
2. 查看服務狀態和資源使用情況
3. 設置告警通知

### 2. 日誌管理

#### 查看應用日誌
```bash
# 查看前端日誌
docker logs frontend-container

# 查看後端日誌
docker logs backend-container

# 查看資料庫日誌
docker logs postgres-container
```

#### 日誌輪轉配置
```bash
# 配置 Docker 日誌輪轉
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 重啟 Docker 服務
systemctl restart docker
```

### 3. 備份策略

#### 資料庫備份
```bash
# 創建資料庫備份腳本
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/casino_db_$DATE.sql"

mkdir -p $BACKUP_DIR
docker exec postgres-container pg_dump -U postgres casino_db > $BACKUP_FILE
gzip $BACKUP_FILE

# 保留最近 30 天的備份
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /root/backup-db.sh
```

#### 設置定時備份
```bash
# 添加 cron 任務
echo "0 2 * * * /root/backup-db.sh" | crontab -
```

### 4. 更新部署

#### 映像更新流程
1. **構建新映像**:
   ```powershell
   # 本地構建新版本
   .\docker-build-and-push.ps1 -Username "your-username" -Repository "your-repo" -Tag "v1.1.0"
   ```

2. **更新 Coolify 配置**:
   - 修改環境變數中的 `IMAGE_TAG`
   - 重新部署服務

3. **零停機更新**:
   - Coolify 支持滾動更新
   - 自動健康檢查確保服務可用性

---

## 🔧 故障排除

### 1. 常見問題

#### 映像拉取失敗
```bash
# 檢查 Docker Hub 認證
docker login -u your-username

# 手動拉取映像測試
docker pull your-username/your-repo-frontend:latest
```

#### 容器啟動失敗
```bash
# 檢查容器日誌
docker logs container-name

# 檢查容器配置
docker inspect container-name

# 檢查資源使用情況
docker stats
```

#### 網路連接問題
```bash
# 檢查容器網路
docker network ls
docker network inspect coolify

# 檢查端口綁定
netstat -tlnp | grep :80
netstat -tlnp | grep :5000
```

### 2. 性能優化

#### 資源監控
```bash
# 系統資源監控
htop
df -h
free -h

# Docker 資源使用
docker stats --no-stream
```

#### 容器優化
```bash
# 清理未使用的映像和容器
docker system prune -a

# 優化映像大小
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### 3. 安全檢查

#### 容器安全掃描
```bash
# 使用 Trivy 掃描映像安全漏洞
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image your-username/your-repo-frontend:latest
```

#### 系統安全更新
```bash
# 定期更新系統
apt update && apt upgrade -y

# 檢查安全更新
unattended-upgrades --dry-run
```

---

## 💰 成本分析

### 1. 月度成本估算

| 項目 | 成本 (USD) | 說明 |
|------|------------|------|
| Hostinger VPS KVM 2 | $7.99 | 2 vCPU, 4GB RAM, 80GB SSD |
| 域名 (.com) | $1.00 | 年費 $12 分攤 |
| SSL 證書 | $0.00 | Let's Encrypt 免費 |
| **總計** | **$8.99** | **每月總成本** |

### 2. 與其他方案對比

| 方案 | 月費 (USD) | 節省比例 |
|------|------------|----------|
| AWS (t3.small + RDS) | $35-50 | 77-82% |
| Google Cloud Platform | $40-60 | 78-85% |
| Azure (B2s + SQL) | $45-65 | 80-86% |
| **Coolify + VPS** | **$8.99** | **基準** |

### 3. 擴展成本

#### 垂直擴展 (升級 VPS)
- KVM 4: $15.99/月 (4 vCPU, 8GB RAM)
- KVM 8: $29.99/月 (8 vCPU, 16GB RAM)

#### 水平擴展 (多 VPS)
- 負載均衡器: +$5/月
- 額外 VPS: +$7.99/月/實例

---

## ✅ 部署檢查清單

### 前期準備
- [ ] VPS 已購買並配置
- [ ] 域名已購買並配置 DNS
- [ ] GitHub Personal Access Token 已創建
- [ ] Docker 映像已構建並推送

### 環境配置
- [ ] VPS 系統已更新
- [ ] Docker 已安裝並配置
- [ ] 防火墻已正確配置
- [ ] Coolify 已安裝並運行

### 部署配置
- [ ] Coolify 項目已創建
- [ ] 環境變數已正確設置
- [ ] Docker Compose 配置已上傳
- [ ] 服務域名已配置

### 服務驗證
- [ ] 資料庫服務正常運行
- [ ] 後端 API 服務可訪問
- [ ] 前端應用正常載入
- [ ] SSL 證書已正確配置

### 監控與維護
- [ ] 健康檢查正常
- [ ] 日誌輪轉已配置
- [ ] 備份策略已實施
- [ ] 監控告警已設置

---

## 🆘 技術支持

### 1. 官方資源
- [Coolify 官方文檔](https://coolify.io/docs)
- [Docker 官方文檔](https://docs.docker.com/)
- [Docker Hub 文檔](https://docs.docker.com/docker-hub/)

### 2. 社群支持
- [Coolify Discord](https://discord.gg/coolify)
- [Docker Community Forums](https://forums.docker.com/)
- [GitHub Community](https://github.community/)

### 3. 故障排除步驟
1. 檢查服務日誌
2. 驗證網路連接
3. 確認環境變數配置
4. 測試映像可用性
5. 聯繫技術支持

---

## 🎉 部署完成

恭喜！你已經成功使用 Docker 容器搭配 Coolify 將全端應用部署到 VPS。

### 下一步建議
1. **監控設置**: 配置 Prometheus + Grafana 監控
2. **CI/CD 優化**: 設置 GitHub Actions 自動部署
3. **性能調優**: 根據實際使用情況調整資源配置
4. **安全加固**: 實施額外的安全措施和定期安全審計
5. **備份測試**: 定期測試備份恢復流程

### 享受你的高效、經濟的部署方案！ 🚀