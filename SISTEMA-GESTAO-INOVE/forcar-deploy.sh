#!/bin/bash
# Executa deploy AGORA sem esperar o cron
REPO=/root/inove-deploy
LOG=/root/deploy.log

echo "[$(date)] Deploy forcado manualmente..." | tee -a $LOG

if [ ! -d "$REPO/.git" ]; then
    git clone https://github.com/3041-6860/Projeto-Claude.git $REPO
fi

cd $REPO
git pull origin main
bash $REPO/SISTEMA-GESTAO-INOVE/go-deploy.sh $REPO 2>&1 | tee -a $LOG
