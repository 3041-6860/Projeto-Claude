#!/bin/bash
echo "=== ATUALIZANDO CRON ===" 
cp /root/inove-deploy/SISTEMA-GESTAO-INOVE/auto-deploy.sh /root/auto-deploy.sh
echo "=== LIMPANDO BUILD ===" 
rm -rf /var/www/inove-prime/.next
rm -f /var/www/package-lock.json
echo "=== COPIANDO ARQUIVOS ===" 
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/app/. /var/www/inove-prime/app/
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/components/. /var/www/inove-prime/components/
echo "=== BUILD (2-3 min) ===" 
cd /var/www/inove-prime && npm run build
echo "=== REINICIANDO ===" 
pm2 restart inove-prime
echo "=== PRONTO ==="
