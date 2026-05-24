#!/bin/bash
REPO=/root/inove-deploy
LOG=/root/deploy.log
if [ ! -d "$REPO/.git" ]; then
    git clone https://github.com/3041-6860/Projeto-Claude.git $REPO >> $LOG 2>&1
    bash $REPO/b >> $LOG 2>&1
    exit 0
fi
cd $REPO
OLD=$(git rev-parse HEAD)
git pull origin main --quiet >> $LOG 2>&1
NEW=$(git rev-parse HEAD)
if [ "$OLD" != "$NEW" ]; then
    echo "[$(date)] Deploy iniciado..." >> $LOG
    bash $REPO/b >> $LOG 2>&1
    echo "[$(date)] Deploy concluido!" >> $LOG
fi