#!/bin/bash
echo "=== LIMPANDO ==="
rm -rf /var/www/inove-prime/.next
rm -f /var/www/package-lock.json
echo "=== COPIANDO ARQUIVOS ==="
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/app/. /var/www/inove-prime/app/
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/components/. /var/www/inove-prime/components/
echo "=== BUILD (aguarde 2-3 min) ==="
cd /var/www/inove-prime && npm run build
echo "=== REINICIANDO ==="
pm2 restart inove-prime
echo "=== PRONTO ==="