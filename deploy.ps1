# 賭場應用部署腳本 (PowerShell版本)
Write-Host "🚀 開始部署賭場應用..." -ForegroundColor Green

# 檢查 Docker 是否安裝
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker 未安裝，請先安裝 Docker" -ForegroundColor Red
    exit 1
}

# 檢查 Docker Compose 是否安裝
if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose 未安裝，請先安裝 Docker Compose" -ForegroundColor Red
    exit 1
}

# 設置環境變數文件
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  未找到 .env.production 文件，使用默認配置" -ForegroundColor Yellow
    Copy-Item ".env.production.example" ".env.production"
}

Write-Host "📦 構建 Docker 容器..." -ForegroundColor Cyan

# 停止現有容器
Write-Host "🛑 停止現有容器..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# 清理舊的鏡像
Write-Host "🧹 清理舊的鏡像..." -ForegroundColor Yellow
docker system prune -f

# 構建並啟動容器
Write-Host "🔨 構建並啟動容器..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml up -d --build

Write-Host "⏳ 等待服務啟動..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 檢查服務狀態
Write-Host "🔍 檢查服務狀態..." -ForegroundColor Cyan

# 檢查 PostgreSQL
Write-Host "📊 檢查 PostgreSQL 數據庫..." -ForegroundColor Cyan
$pgCheck = docker exec casino-postgres-prod pg_isready -U app_user -d casino
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL 數據庫運行正常" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL 數據庫啟動失敗" -ForegroundColor Red
    exit 1
}

# 檢查後端 API
Write-Host "🌐 檢查後端 API..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction Stop
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✅ 後端 API 運行正常" -ForegroundColor Green
    } else {
        throw "HTTP Status: $($healthCheck.StatusCode)"
    }
} catch {
    Write-Host "❌ 後端 API 啟動失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 檢查前端應用
Write-Host "🎨 檢查前端應用..." -ForegroundColor Cyan
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:80" -Method Get -ErrorAction Stop
    if ($frontendCheck.StatusCode -eq 200) {
        Write-Host "✅ 前端應用運行正常" -ForegroundColor Green
    } else {
        throw "HTTP Status: $($frontendCheck.StatusCode)"
    }
} catch {
    Write-Host "❌ 前端應用啟動失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 服務信息：" -ForegroundColor Cyan
Write-Host "  前端應用: http://localhost:80" -ForegroundColor White
Write-Host "  後端 API: http://localhost:5000" -ForegroundColor White
Write-Host "  數據庫: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "🔧 管理命令：" -ForegroundColor Cyan
Write-Host "  查看日誌: docker-compose -f docker-compose.prod.yml logs" -ForegroundColor White
Write-Host "  停止服務: docker-compose -f docker-compose.prod.yml down" -ForegroundColor White
Write-Host "  重啟服務: docker-compose -f docker-compose.prod.yml restart" -ForegroundColor White