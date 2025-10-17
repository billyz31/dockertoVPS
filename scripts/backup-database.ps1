# ============================================
# 資料庫自動備份腳本 (Windows PowerShell版本)
# 用於備份 PostgreSQL 資料庫到指定目錄
# ============================================

# 配置參數
$BACKUP_DIR = "C:\Backups\PostgreSQL"
$CONTAINER_NAME = "casino-postgres-prod"
$DB_NAME = "casino"
$DB_USER = "app_user"
$RETENTION_DAYS = 30
$LOG_FILE = "C:\Backups\db-backup.log"

# 創建備份目錄
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

# 獲取當前時間
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\${DB_NAME}_backup_$TIMESTAMP.sql"
$COMPRESSED_FILE = "$BACKUP_FILE.gz"

# 記錄開始時間
$logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 開始資料庫備份"
Write-Output $logMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8

# 檢查 Docker 容器是否運行
try {
    $containerStatus = docker ps --format "{{.Names}}" | Select-String -Pattern "^$CONTAINER_NAME$"
    if (-not $containerStatus) {
        $errorMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 錯誤: 容器 $CONTAINER_NAME 未運行"
        Write-Output $errorMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
        exit 1
    }
} catch {
    $errorMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 錯誤: 檢查容器狀態失敗 - $($_.Exception.Message)"
    Write-Output $errorMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
    exit 1
}

# 執行資料庫備份
try {
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 正在備份資料庫 $DB_NAME..."
    Write-Output $logMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
    
    # 執行 pg_dump 命令
    $backupCommand = "docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME"
    Invoke-Expression $backupCommand | Out-File -FilePath $BACKUP_FILE -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        # 壓縮備份文件 (使用 7-Zip 或類似的壓縮工具)
        try {
            # 如果安裝了 7-Zip
            if (Get-Command "7z" -ErrorAction SilentlyContinue) {
                7z a -tgzip "$COMPRESSED_FILE" "$BACKUP_FILE" | Out-Null
            } else {
                # 使用 PowerShell 內置的壓縮 (需要 .NET 4.5+)
                $inputStream = New-Object System.IO.FileStream $BACKUP_FILE, ([IO.FileMode]::Open)
                $outputStream = New-Object System.IO.FileStream $COMPRESSED_FILE, ([IO.FileMode]::Create)
                $gzipStream = New-Object System.IO.Compression.GzipStream $outputStream, ([IO.Compression.CompressionMode]::Compress)
                $inputStream.CopyTo($gzipStream)
                $gzipStream.Close()
                $outputStream.Close()
                $inputStream.Close()
            }
            
            # 刪除未壓縮的備份文件
            Remove-Item $BACKUP_FILE -Force
            
            $successMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 備份成功: $COMPRESSED_FILE"
            Write-Output $successMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            
            # 計算備份文件大小
            $backupSize = (Get-Item $COMPRESSED_FILE).Length / 1MB
            $sizeMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 備份文件大小: {0:N2} MB" -f $backupSize
            Write-Output $sizeMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            
            # 清理舊備份
            $cleanupMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 清理 $RETENTION_DAYS 天前的舊備份..."
            Write-Output $cleanupMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            
            $cutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)
            Get-ChildItem $BACKUP_DIR -Filter "*.sql.gz" | Where-Object { 
                $_.LastWriteTime -lt $cutoffDate 
            } | ForEach-Object {
                $deleteMessage = "刪除舊備份: $($_.Name)"
                Write-Output $deleteMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
                Remove-Item $_.FullName -Force
            }
            
            # 顯示當前備份文件列表
            $listMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 當前備份文件:"
            Write-Output $listMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            Get-ChildItem $BACKUP_DIR -Filter "*.sql.gz" | ForEach-Object {
                $fileInfo = "$($_.Name) - $($_.Length / 1KB | ForEach-Object { '{0:N2}' -f $_ }) KB - $($_.LastWriteTime)"
                Write-Output $fileInfo | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            }
            
            $completeMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 備份任務完成"
            Write-Output $completeMessage | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            exit 0
            
        } catch {
            $compressError = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 錯誤: 壓縮備份文件失敗 - $($_.Exception.Message)"
            Write-Output $compressError | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
            exit 1
        }
    } else {
        $backupError = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 錯誤: 資料庫備份失敗 (退出碼: $LASTEXITCODE)"
        Write-Output $backupError | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
        # 清理失敗的備份文件
        if (Test-Path $BACKUP_FILE) {
            Remove-Item $BACKUP_FILE -Force
        }
        exit 1
    }
} catch {
    $exceptionError = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 錯誤: 執行備份時發生異常 - $($_.Exception.Message)"
    Write-Output $exceptionError | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
    exit 1
}