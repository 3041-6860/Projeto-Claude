#!/bin/bash
set -e
LOG=/tmp/deploy.log
exec > >(tee $LOG) 2>&1

echo "=== Deploy iniciado: $(date) ==="

# Libera memória: mata processos antigos de build/node antes de começar
echo "=== Limpando processos antigos ==="
pkill -9 -f "npm run build" 2>/dev/null || true
pkill -9 -f "next build"    2>/dev/null || true
sleep 2

echo "=== Memoria disponivel ==="
free -h

cp /root/inove-deploy/SISTEMA-GESTAO-INOVE/auto-deploy.sh /root/auto-deploy.sh || true
rm -rf /var/www/inove-prime/.next
rm -f /var/www/package-lock.json || true
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/app/.        /var/www/inove-prime/app/
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/components/. /var/www/inove-prime/components/
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/public/.     /var/www/inove-prime/public/
mkdir -p /var/www/inove-prime/lib
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/lib/.        /var/www/inove-prime/lib/
cp -f  /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/middleware.ts  /var/www/inove-prime/middleware.ts
cp -f  /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/next.config.ts /var/www/inove-prime/next.config.ts

cd /var/www/inove-prime
echo "=== Iniciando build (memoria limitada a 1024MB) ==="
NODE_OPTIONS="--max-old-space-size=1024" npm run build

echo "=== Reiniciando PM2 ==="
pm2 delete inove-prime || true
pm2 start npm --name "inove-prime" --cwd /var/www/inove-prime -- start
pm2 save

echo "=== Aguardando app iniciar (15s) ==="
sleep 15
curl -sfL http://localhost:3001 > /dev/null \
  && echo "=== App OK na porta 3001 ===" \
  || { echo "=== ERRO: App nao respondeu na porta 3001 ==="; pm2 logs inove-prime --lines 20 --nostream; exit 1; }

echo "=== PRONTO ==="
