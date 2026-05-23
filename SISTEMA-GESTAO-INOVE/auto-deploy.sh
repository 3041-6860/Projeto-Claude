#!/bin/bash
REPO=/root/inove-deploy
LOG=/root/deploy.log
B=/var/www/inove-prime

# Primeira vez: clonar repositorio
if [ ! -d "$REPO/.git" ]; then
    echo "[$(date)] Clonando repositorio pela primeira vez..." >> $LOG
    git clone https://github.com/3041-6860/Projeto-Claude.git $REPO >> $LOG 2>&1
    bash $REPO/SISTEMA-GESTAO-INOVE/go-deploy.sh $REPO >> $LOG 2>&1
    exit 0
fi

# Verificar se tem atualizacao no GitHub
cd $REPO
OLD=$(git rev-parse HEAD)
git pull origin main --quiet >> $LOG 2>&1
NEW=$(git rev-parse HEAD)

if [ "$OLD" != "$NEW" ]; then
    echo "[$(date)] Nova versao detectada! Iniciando deploy..." >> $LOG
    bash $REPO/SISTEMA-GESTAO-INOVE/go-deploy.sh $REPO >> $LOG 2>&1
    echo "[$(date)] Deploy concluido!" >> $LOG
fi
