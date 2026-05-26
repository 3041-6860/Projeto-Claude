#!/bin/bash
LOG=/tmp/deploy.log
echo "Iniciando..." > $LOG
cp /root/inove-deploy/SISTEMA-GESTAO-INOVE/auto-deploy.sh /root/auto-deploy.sh >> $LOG 2>&1
rm -rf /var/www/inove-prime/.next >> $LOG 2>&1
rm -f /var/www/package-lock.json >> $LOG 2>&1
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/app/. /var/www/inove-prime/app/ >> $LOG 2>&1
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/components/. /var/www/inove-prime/components/ >> $LOG 2>&1
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/public/. /var/www/inove-prime/public/ >> $LOG 2>&1
mkdir -p /var/www/inove-prime/lib >> $LOG 2>&1
cp -rf /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/lib/. /var/www/inove-prime/lib/ >> $LOG 2>&1
cp -f /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/middleware.ts /var/www/inove-prime/middleware.ts >> $LOG 2>&1
cp -f /root/inove-deploy/SISTEMA-GESTAO-INOVE/src/next.config.ts /var/www/inove-prime/next.config.ts >> $LOG 2>&1
cd /var/www/inove-prime >> $LOG 2>&1
npm run build >> $LOG 2>&1
pm2 restart inove-prime >> $LOG 2>&1
echo "PRONTO" >> $LOG
