#!/bin/bash
REPO=${1:-/root/inove-deploy}
B=/var/www/inove-prime
S=$REPO/SISTEMA-GESTAO-INOVE/src

echo "Criando diretorios..."
mkdir -p "$B/app/(app)/rh/ponto"
mkdir -p "$B/app/(app)/rh/ferias"
mkdir -p "$B/app/(app)/rh/organograma"
mkdir -p "$B/app/(app)/rh/relatorios"
mkdir -p "$B/app/login"
mkdir -p "$B/public"

echo "Copiando arquivos..."
cp -rf "$S/app/." "$B/app/"
cp -rf "$S/components/." "$B/components/"
cp -rf "$S/public/." "$B/public/"

echo "Fazendo build..."
cd "$B"
npm run build

echo "Reiniciando servidor..."
pm2 restart inove-prime

echo "=== DEPLOY CONCLUIDO ==="
