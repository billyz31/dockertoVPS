#!/bin/bash

# 賭場應用部署腳本
set -e

echo "🚀 開始部署賭場應用..."

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

# 檢查 Docker Compose 是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 設置環境變數文件
if [ ! -f .env.production ]; then
    echo "⚠️  未找到 .env.production 文件，使用默認配置"
    cp .env.production.example .env.production
fi

# 加載環境變數
export $(grep -v '^#' .env.production | xargs)

echo "📦 構建 Docker 容器..."

# 停止現有容器
echo "🛑 停止現有容器..."
docker-compose -f docker-compose.prod.yml down

# 清理舊的鏡像
echo "🧹 清理舊的鏡像..."
docker system prune -f

# 構建並啟動容器
echo "🔨 構建並啟動容器..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "🔍 檢查服務狀態..."

# 檢查 PostgreSQL
echo "📊 檢查 PostgreSQL 數據庫..."
if docker exec casino-postgres-prod pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; then
    echo "✅ PostgreSQL 數據庫運行正常"
else
    echo "❌ PostgreSQL 數據庫啟動失敗"
    exit 1
fi

# 檢查後端 API
echo "🌐 檢查後端 API..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ 後端 API 運行正常"
else
    echo "❌ 後端 API 啟動失敗"
    exit 1
fi

# 檢查前端應用
echo "🎨 檢查前端應用..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ 前端應用運行正常"
else
    echo "❌ 前端應用啟動失敗"
    exit 1
fi

echo "🎉 部署完成！"
echo ""
echo "📋 服務信息："
echo "  前端應用: http://localhost:80"
echo "  後端 API: http://localhost:5000"
echo "  數據庫: localhost:5432"
echo ""
echo "🔧 管理命令："
echo "  查看日誌: docker-compose -f docker-compose.prod.yml logs"
echo "  停止服務: docker-compose -f docker-compose.prod.yml down"
echo "  重啟服務: docker-compose -f docker-compose.prod.yml restart"