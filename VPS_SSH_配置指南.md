# VPS SSH端口22配置和故障排除指南

## 🚨 當前問題診斷

### 連接測試結果
- **SSH端口22**: ❌ 連接失敗 (Connection timed out)
- **Coolify端口8000**: ❌ 連接失敗 (Connection timed out)
- **Ping測試**: ❌ 失敗 (TimedOut)

### 可能原因分析
1. **VPS防火牆阻擋**: 系統防火牆可能阻擋了SSH連接
2. **雲服務商安全組**: Hostinger的網路安全組可能未開放端口22
3. **SSH服務未啟動**: SSH daemon可能未運行
4. **網路路由問題**: ISP或網路路由問題

## 🔧 解決方案步驟

### 1. 通過Hostinger控制台訪問VPS

由於無法通過SSH連接，需要使用Hostinger的Web控制台：

1. 登入Hostinger控制台
2. 找到你的VPS實例
3. 使用"Console"或"Terminal"功能直接訪問VPS

### 2. 檢查SSH服務狀態

在VPS控制台中執行：

```bash
# 檢查SSH服務狀態
sudo systemctl status ssh
sudo systemctl status sshd

# 如果服務未運行，啟動SSH服務
sudo systemctl start ssh
sudo systemctl enable ssh

# 檢查SSH配置
sudo nano /etc/ssh/sshd_config
```

### 3. 檢查防火牆設置

```bash
# 檢查UFW防火牆狀態
sudo ufw status

# 如果防火牆啟用，允許SSH
sudo ufw allow 22/tcp
sudo ufw allow ssh

# 檢查iptables規則
sudo iptables -L -n

# 如果需要，添加SSH規則
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

### 4. 檢查端口監聽狀態

```bash
# 檢查端口22是否被監聽
sudo netstat -tlnp | grep :22
sudo ss -tlnp | grep :22

# 檢查所有監聽端口
sudo netstat -tlnp
```

### 5. 檢查SSH配置文件

```bash
# 編輯SSH配置
sudo nano /etc/ssh/sshd_config

# 確保以下設置正確：
Port 22
PermitRootLogin yes  # 臨時允許，後續會改為no
PasswordAuthentication yes
PubkeyAuthentication yes
```

### 6. 重啟SSH服務

```bash
# 重啟SSH服務
sudo systemctl restart ssh
sudo systemctl restart sshd

# 檢查服務狀態
sudo systemctl status ssh
```

## 🛡️ 安全加固配置

### 1. 配置SSH金鑰認證

```bash
# 在本地生成SSH金鑰對（如果還沒有）
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 將公鑰複製到VPS
ssh-copy-id root@95.179.131.99

# 或手動添加公鑰
mkdir -p ~/.ssh
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 2. 加強SSH安全設置

編輯 `/etc/ssh/sshd_config`：

```bash
# 禁用root直接登入（在設置好其他用戶後）
PermitRootLogin no

# 禁用密碼認證（在設置好金鑰後）
PasswordAuthentication no

# 限制登入嘗試
MaxAuthTries 3

# 設置空閒超時
ClientAliveInterval 300
ClientAliveCountMax 2

# 限制用戶
AllowUsers your-username

# 更改默認端口（可選）
Port 2222
```

### 3. 安裝和配置fail2ban

```bash
# 安裝fail2ban
sudo apt update
sudo apt install fail2ban

# 創建本地配置文件
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 編輯配置
sudo nano /etc/fail2ban/jail.local

# 在[sshd]部分設置：
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

# 啟動fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 4. 配置防火牆規則

```bash
# 重置UFW並設置默認規則
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允許SSH
sudo ufw allow 22/tcp

# 允許HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允許Coolify端口
sudo ufw allow 8000/tcp

# 啟用防火牆
sudo ufw enable

# 檢查狀態
sudo ufw status verbose
```

## 🔍 Hostinger特定設置

### 檢查Hostinger控制台設置

1. **網路安全組**: 在Hostinger控制台中檢查安全組設置
2. **防火牆規則**: 確保允許端口22的入站流量
3. **VPS狀態**: 確認VPS正在運行且網路配置正確

### Hostinger防火牆配置

在Hostinger控制台中：
1. 進入VPS管理頁面
2. 找到"Firewall"或"Security Groups"設置
3. 添加規則：
   - 協議: TCP
   - 端口: 22
   - 來源: 0.0.0.0/0 (或限制特定IP)
   - 動作: Allow

## 📋 故障排除檢查清單

- [ ] VPS是否正在運行
- [ ] SSH服務是否啟動
- [ ] 端口22是否被監聽
- [ ] 系統防火牆是否允許端口22
- [ ] Hostinger安全組是否開放端口22
- [ ] SSH配置文件是否正確
- [ ] 網路連接是否正常

## 🚀 下一步操作

1. 使用Hostinger控制台訪問VPS
2. 按照上述步驟檢查和配置SSH
3. 測試SSH連接
4. 實施安全加固措施
5. 配置Coolify部署

---

**注意**: 在進行任何配置更改前，請確保你有其他方式訪問VPS（如Hostinger控制台），以防SSH配置錯誤導致無法連接。