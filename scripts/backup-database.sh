#!/bin/bash

# ============================================
# 資料庫自動備份腳本
# 用於備份 PostgreSQL 資料庫到指定目錄
# ============================================

# 配置參數
BACKUP_DIR="/var/backups/postgres"
CONTAINER_NAME="casino-postgres-prod"
DB_NAME="casino"
DB_USER="app_user"
RETENTION_DAYS=30
LOG_FILE="/var/log/db-backup.log"

# 創建備份目錄
mkdir -p "$BACKUP_DIR"

# 獲取當前時間
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

# 記錄開始時間
echo "$(date '+%Y-%m-%d %H:%M:%S') - 開始資料庫備份" | tee -a "$LOG_FILE"

# 檢查 Docker 容器是否運行
if ! docker ps --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 錯誤: 容器 $CONTAINER_NAME 未運行" | tee -a "$LOG_FILE"
    exit 1
fi

# 執行資料庫備份
echo "$(date '+%Y-%m-%d %H:%M:%S') - 正在備份資料庫 $DB_NAME..." | tee -a "$LOG_FILE"

if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    # 壓縮備份文件
    if gzip -f "$BACKUP_FILE" 2>> "$LOG_FILE"; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 備份成功: $COMPRESSED_FILE" | tee -a "$LOG_FILE"
        
        # 計算備份文件大小
        BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 備份文件大小: $BACKUP_SIZE" | tee -a "$LOG_FILE"
        
        # 清理舊備份
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 清理 $RETENTION_DAYS 天前的舊備份..." | tee -a "$LOG_FILE"
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print 2>> "$LOG_FILE" | tee -a "$LOG_FILE"
        
        # 顯示當前備份文件列表
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 當前備份文件:" | tee -a "$LOG_FILE"
        ls -la "$BACKUP_DIR/"*.sql.gz 2>/dev/null | tee -a "$LOG_FILE"
        
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 備份任務完成" | tee -a "$LOG_FILE"
        exit 0
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 錯誤: 壓縮備份文件失敗" | tee -a "$LOG_FILE"
        exit 1
    fi
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 錯誤: 資料庫備份失敗" | tee -a "$LOG_FILE"
    # 清理失敗的備份文件
    rm -f "$BACKUP_FILE"
    exit 1
fi