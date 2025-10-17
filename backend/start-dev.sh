#!/bin/sh
# 開發環境啟動腳本
echo "Starting development server with ts-node..."
npx ts-node --esm --experimental-specifier-resolution=node src/index.ts