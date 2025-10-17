# 生產環境 Dockerfile for Coolify
# Coolify 會自動偵測並構建相應的服務

FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 設置環境變量
ENV NODE_ENV=production

# 複製 package.json 文件
COPY package*.json ./

# 根據構建上下文自動選擇構建前端或後端
# Coolify 會根據服務配置自動設置構建上下文

# 安裝依賴並構建應用
RUN if [ -f "frontend/package.json" ]; then \
    cd frontend && npm install && npm run build; \
    elif [ -f "backend/package.json" ]; then \
    cd backend && npm install && npm run build; \
    else \
    echo "Error: No frontend or backend package.json found"; \
    exit 1; \
    fi

# 暴露端口
EXPOSE 3000

# 啟動命令 - Coolify 會根據服務類型覆蓋此命令
CMD ["echo", "Please configure specific start command in Coolify service settings"]