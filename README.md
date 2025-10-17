# 全端Docker化Web應用程式

## 🚀 項目概述

這是一個使用Docker容器化技術的全端Web應用程式，專為在Hostinger VPS上部署並通過Coolify平台管理而設計。

## 📁 項目結構

```
fullstack-docker-app/
├── frontend/          # React前端應用
├── backend/           # Node.js後端API
├── database/          # 數據庫初始化腳本
├── deploy/            # 部署配置文件
├── docker-compose.yml # 開發環境Docker編排
├── docker-compose.prod.yml # 生產環境配置
└── README.md
```

## 🛠️ 技術棧

### 前端
- React 18
- TypeScript
- Vite (構建工具)
- Tailwind CSS

### 後端
- Node.js
- Express.js
- TypeScript
- PostgreSQL

### 基礎設施
- Docker & Docker Compose
- PostgreSQL (數據庫)

## 🚦 快速開始

### 開發環境
```bash
# 克隆項目
git clone <repository-url>
cd fullstack-docker-app

# 啟動開發環境
docker-compose up --build
```

### 生產部署
```bash
# 構建生產鏡像
docker-compose -f docker-compose.prod.yml build

# 啟動生產環境
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 訪問地址

- 前端應用: http://localhost:3000
- 後端API: http://localhost:5000
- API文檔: http://localhost:5000/api-docs

## 📋 功能特性

- ✅ 響應式Web設計
- ✅ RESTful API
- ✅ 數據庫持久化
- ✅ Docker容器化
- ✅ 熱重載開發
- ✅ 生產環境優化
- ✅ 健康檢查監控
- ✅ 日誌管理

## 🚀 部署目標

1. **本地開發** - Docker Compose
2. **Hostinger VPS** - 手動部署測試
3. **Coolify平台** - 自動化容器部署

## 📊 環境配置

複製並配置環境變量：
```bash
cp .env.example .env
# 編輯.env文件設置您的配置
```

## 🔧 開發命令

```bash
# 安裝依賴 (開發)
docker-compose run --rm frontend npm install
docker-compose run --rm backend npm install

# 運行測試
docker-compose run --rm frontend npm test
docker-compose run --rm backend npm test

# 查看日誌
docker-compose logs -f
```

## 📝 文檔

- [API文檔](./docs/API.md)
- [部署指南](./docs/DEPLOYMENT.md)
- [數據庫設計](./docs/DATABASE.md)

## 🤝 貢獻指南

1. Fork項目
2. 創建特性分支
3. 提交更改
4. 推送到分支
5. 創建Pull Request

## 📄 許可證

MIT License - 詳見 [LICENSE](./LICENSE) 文件