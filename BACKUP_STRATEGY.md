# 📋 資料庫備份策略指南

## 🎯 備份目標

確保賭場應用資料庫的數據安全，實現：
- ✅ **自動化每日備份**
- ✅ **30天備份保留**
- ✅ **備份驗證和監控**
- ✅ **快速恢復能力**

## 📊 備份架構

### 備份頻率和保留策略
| 備份類型 | 頻率 | 保留時間 | 存儲位置 |
|----------|------|----------|----------|
| 完整備份 | 每日凌晨2點 | 30天 | 本地VPS |
| 緊急備份 | 手動觸發 | 永久 | 本地+異地 |

### 備份文件命名規範
```
casino_backup_YYYYMMDD_HHMMSS.sql.gz
```

## 🛠️ 備份實施

### 1. Linux環境備份設置

#### 安裝備份腳本
```bash
# 複製備份腳本到系統目錄
sudo cp scripts/backup-database.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-database.sh

# 創建備份目錄
sudo mkdir -p /var/backups/postgres
sudo chmod 755 /var/backups/postgres
```

#### 設置定時任務 (cron)
```bash
# 編輯cron任務
sudo crontab -e

# 添加以下行（每日凌晨2點執行）
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/db-backup.log 2>&1

# 重啟cron服務
sudo systemctl restart cron
```

### 2. Windows環境備份設置

#### 手動執行備份
```powershell
# 執行備份腳本
.\scripts\backup-database.ps1
```

#### 設置定時任務 (任務計劃程序)
1. 打開「任務計劃程序」
2. 創建基本任務
3. 名稱: "Casino Database Backup"
4. 觸發器: 每日 2:00 AM
5. 操作: 啟動程序
6. 程序/腳本: `powershell.exe`
7. 參數: `-ExecutionPolicy Bypass -File "C:\path\to\backup-database.ps1"`

## 🔍 備份驗證

### 定期檢查備份完整性
```bash
# 檢查最新備份文件
ls -la /var/backups/postgres/

# 驗證備份文件完整性
gzip -t /var/backups/postgres/casino_backup_*.sql.gz

# 檢查備份日誌
tail -f /var/log/db-backup.log
```

### 備份恢復測試
```bash
# 創建測試數據庫
docker exec -it casino-postgres-prod createdb -U app_user test_restore

# 恢復備份到測試數據庫
zcat /var/backups/postgres/casino_backup_20241201_020000.sql.gz | \
  docker exec -i casino-postgres-prod psql -U app_user test_restore

# 驗證數據完整性
docker exec -it casino-postgres-prod psql -U app_user test_restore -c "SELECT COUNT(*) FROM users;"

# 清理測試數據庫
docker exec -it casino-postgres-prod dropdb -U app_user test_restore
```

## 📈 監控和告警

### 備份狀態監控
```bash
# 檢查最近一次備份狀態
LAST_BACKUP=$(find /var/backups/postgres -name "*.sql.gz" -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2-)
BACKUP_TIME=$(stat -c %y "$LAST_BACKUP" 2>/dev/null || echo "No backup found")

# 檢查備份是否在24小時內
if [ -n "$LAST_BACKUP" ]; then
    BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LAST_BACKUP")) / 3600 ))
    if [ $BACKUP_AGE -gt 24 ]; then
        echo "警告: 最後備份已超過24小時"
    fi
fi
```

### 磁碟空間監控
```bash
# 檢查備份目錄空間使用
BACKUP_USAGE=$(df -h /var/backups | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $BACKUP_USAGE -gt 80 ]; then
    echo "警告: 備份目錄空間使用超過80%"
fi
```

## 🚨 緊急恢復流程

### 數據庫恢復步驟
1. **停止應用服務**
   ```bash
   docker-compose -f docker-compose.prod.yml stop backend frontend
   ```

2. **備份當前狀態**
   ```bash
   docker exec casino-postgres-prod pg_dump -U app_user casino > emergency_backup.sql
   ```

3. **恢復目標備份**
   ```bash
   # 解壓並恢復備份
   zcat /var/backups/postgres/casino_backup_20241201_020000.sql.gz | \
     docker exec -i casino-postgres-prod psql -U app_user casino
   ```

4. **驗證數據完整性**
   ```bash
   docker exec -it casino-postgres-prod psql -U app_user casino -c "\dt"
   ```

5. **重啟應用服務**
   ```bash
   docker-compose -f docker-compose.prod.yml start backend frontend
   ```

## 🔄 異地備份策略（可選）

### 使用rsync同步到遠端服務器
```bash
# 配置SSH密鑰認證
ssh-copy-id user@backup-server

# 設置遠端同步腳本
cat > /usr/local/bin/sync-backups.sh << 'EOF'
#!/bin/bash
rsync -avz --delete /var/backups/postgres/ user@backup-server:/backups/casino-db/
EOF

chmod +x /usr/local/bin/sync-backups.sh

# 添加到cron（每日凌晨3點執行）
0 3 * * * /usr/local/bin/sync-backups.sh
```

### 使用雲存儲備份（AWS S3/Google Cloud Storage）
```bash
# 安裝AWS CLI
sudo apt install awscli

# 配置備份到S3
cat > /usr/local/bin/backup-to-s3.sh << 'EOF'
#!/bin/bash
LATEST_BACKUP=$(find /var/backups/postgres -name "*.sql.gz" -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2-)
aws s3 cp "$LATEST_BACKUP" s3://your-bucket/casino-backups/
EOF

chmod +x /usr/local/bin/backup-to-s3.sh
```

## 📊 備份報告

### 每日備份報告
```bash
# 生成每日備份報告
cat > /usr/local/bin/backup-report.sh << 'EOF'
#!/bin/bash
REPORT_FILE="/var/log/backup-report-$(date +%Y%m%d).txt"

echo "=== 每日備份報告 $(date) ===" > "$REPORT_FILE"
echo "備份目錄: /var/backups/postgres" >> "$REPORT_FILE"
echo "備份文件數量: $(find /var/backups/postgres -name "*.sql.gz" | wc -l)" >> "$REPORT_FILE"
echo "總備份大小: $(du -sh /var/backups/postgres | cut -f1)" >> "$REPORT_FILE"
echo "最新備份: $(find /var/backups/postgres -name "*.sql.gz" -printf "%Tb %Td %TH:%TM %p\n" | sort -r | head -1)" >> "$REPORT_FILE"

# 發送郵件報告（如果配置了郵件服務）
# cat "$REPORT_FILE" | mail -s "每日備份報告" admin@example.com
EOF
```

## 🛡️ 安全考慮

### 備份文件安全
```bash
# 設置備份文件權限
chmod 600 /var/backups/postgres/*.sql.gz

# 加密敏感備份（可選）
gpg --encrypt --recipient admin@example.com backup_file.sql.gz
```

### 訪問控制
```bash
# 限制備份目錄訪問
chown root:root /var/backups/postgres
chmod 700 /var/backups/postgres
```

---

## ✅ 實施檢查清單

- [ ] 備份腳本已部署到服務器
- [ ] 定時任務已配置
- [ ] 備份目錄權限已設置
- [ ] 首次備份已成功執行
- [ ] 備份驗證測試已完成
- [ ] 監控告警已配置
- [ ] 恢復流程文檔已準備

## 📞 支持信息

如果遇到備份問題：
1. 檢查 `/var/log/db-backup.log` 日誌文件
2. 驗證Docker容器運行狀態
3. 檢查磁碟空間是否充足
4. 確認數據庫連接配置正確

**最後更新**: $(date +%Y-%m-%d)
**文檔版本**: 1.0