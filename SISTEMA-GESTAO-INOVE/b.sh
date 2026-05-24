#!/bin/bash
echo "=== LIMPANDO BUILD ANTIGO ==="
cd /var/www/inove-prime
rm -rf .next
rm -f /var/www/package-lock.json

echo "=== COPIANDO ARQUIVOS NOVOS ==="
S=/root/inove-deploy/SISTEMA-GESTAO-INOVE/src
cp -rf "$S/app/." /var/www/inove-prime/app/
cp -rf "$S/components/." /var/www/inove-prime/components/

echo "=== FAZENDO BUILD ==="
npm run build

echo "=== REINICIANDO ==="
pm2 restart inove-prime

echo "=== PRONTO ==="
