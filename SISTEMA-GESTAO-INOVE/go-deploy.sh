#!/bin/bash
REPO=${1:-/root/inove-deploy}
B=/var/www/inove-prime
S=$REPO/SISTEMA-GESTAO-INOVE/src
rm -rf "$B/.next"
rm -f /var/www/package-lock.json
cp -rf "$S/app/." "$B/app/"
cp -rf "$S/components/." "$B/components/"
cd "$B" && npm run build
pm2 restart inove-prime
echo "=== DEPLOY CONCLUIDO ==="