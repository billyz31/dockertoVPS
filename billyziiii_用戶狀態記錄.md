# billyziiii 用戶狀態記錄

## 📋 基本信息

**記錄時間**: 2025年10月13日  
**系統**: Ubuntu 22.04.4 LTS (Hostinger VPS)  
**IP地址**: 72.60.198.67  

## 🔐 登入憑證

### SSH 金鑰認證
- **私鑰路徑**: `$HOME\.ssh\hostinger_vps_key`
- **公鑰**: 已配置在VPS的 `~/.ssh/authorized_keys` 中
- **連接命令**: 
  ```bash
  ssh -i $HOME\.ssh\hostinger_vps_key billyziiii@72.60.198.67
  ```

### 用戶密碼
- **用戶名**: `billyziiii`
- **密碼**: `123`
- **sudo密碼**: `billy123`

## 👥 用戶組成員資格

- **主要組**: `billyziiii`
- **附加組**: 
  - `sudo` - 具有管理員權限
  - `docker` - 可直接執行Docker命令

## 🛡️ 系統安全配置

### SSH 服務配置
```bash
Port 2222
Port 22
PasswordAuthentication no  # 禁用密碼登錄
PermitRootLogin yes
```

### 防火牆配置 (UFW)
- **狀態**: 啟用 (active)
- **默認策略**: 
  - 入站: deny (拒絕)
  - 出站: allow (允許)
  - 路由: deny (拒絕)
- **開放端口**:
  - 2222 (所有來源)
  - 22/tcp (所有來源)

## 🐳 Docker 環境配置

### Docker 服務狀態
- **狀態**: 運行中 (active)
- **版本**: Docker Engine 26.1.3
- **用戶權限**: `billyziiii` 用戶可直接執行 `docker` 命令，無需 `sudo`

### 當前運行容器
```bash
CONTAINER ID   IMAGE                          COMMAND                  STATUS       PORTS                                                                      NAMES
c7b0b5b9b1d8   ghcr.io/coollabsio/coolify-sentinel:latest   "/bin/sh -c 'node di…"   Up 2 hours                                                              coolify-sentinel
f4d5d6b8e5a9   ghcr.io/coollabsio/coolify-proxy:latest       "/entrypoint.sh"         Up 2 hours   0.0.0.0:80->3000/tcp, :::80->3000/tcp, 0.0.0.0:443->3000/tcp, :::443->3000/tcp   coolify-proxy
c2b6b3b7b4b5   ghcr.io/coollabsio/coolify:latest             "/bin/sh -c 'node di…"   Up 2 hours                                                              coolify
b8b9b0b1b2b3   ghcr.io/coollabsio/coolify-realtime:latest    "/bin/sh -c 'node di…"   Up 2 hours                                                              coolify-realtime
b4b5b6b7b8b9   redis:7-alpine                                "docker-entrypoint.s…"   Up 2 hours   6379/tcp                                                   coolify-redis
b0b1b2b3b4b5   postgres:15-alpine                            "docker-entrypoint.s…"   Up 2 hours   5432/tcp                                                   coolify-db
```

## 💾 系統資源狀態

### 磁盤空間使用
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        96G  6.2G   90G   7% /
/dev/sda16      881M  115M  705M  14% /boot
/dev/sda15      105M  6.2M   99M   6% /boot/efi
```

### 內存使用
- **總內存**: 7.7GB
- **可用內存**: 充足

## 🌐 網絡配置

### 網絡接口
- **主要接口**: `eth0` (172.18.0.130/24)
- **Docker網絡**: 
  - `docker0` (172.17.0.1/16)
  - `br-652cefab7afd` (自定義橋接網絡)

### 開放端口服務
- **80/tcp**: HTTP (Coolify代理)
- **443/tcp**: HTTPS (Coolify代理)
- **2222/tcp**: SSH備用端口
- **22/tcp**: SSH主端口

## 📁 重要文件位置

### SSH 配置
- **客戶端私鑰**: `C:\Users\kaich\.ssh\hostinger_vps_key`
- **服務端配置**: `/etc/ssh/sshd_config`
- **授權密鑰**: `/home/billyziiii/.ssh/authorized_keys`

### Docker 相關
- **Docker配置**: `/etc/docker/daemon.json`
- **Docker鏡像存儲**: `/var/lib/docker`

## ⚠️ 重要注意事項

1. **SSH安全**: 當前配置禁用密碼登錄，僅允許金鑰認證
2. **sudo權限**: `billyziiii` 用戶具有完整的管理員權限
3. **Docker權限**: 用戶已加入docker組，可直接管理容器
4. **防火牆**: UFW已啟用，僅開放必要端口
5. **備用SSH端口**: 2222端口作為SSH備用訪問通道

## 🔄 恢復步驟

### 如果無法登錄
1. 通過Hostinger控制面板訪問VPS
2. 使用救援模式重置SSH配置
3. 重新上傳SSH公鑰到`~/.ssh/authorized_keys`

### 如果忘記密碼
1. 通過Hostinger控制面板重置root密碼
2. 使用root權限重置`billyziiii`用戶密碼：
   ```bash
   sudo passwd billyziiii
   ```

### 如果Docker權限丟失
```bash
sudo usermod -aG docker billyziiii
# 需要重新登錄使權限生效
```

## 📞 緊急聯繫信息

- **VPS提供商**: Hostinger
- **控制面板**: https://hpanel.hostinger.com
- **服務器位置**: 美國
- **支持渠道**: Hostinger客戶支持

---
*此文件應妥善保管，包含敏感認證信息。建議加密存儲或使用密碼管理器管理。*