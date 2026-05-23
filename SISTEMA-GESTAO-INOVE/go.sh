#!/bin/bash
echo ""
echo "=== INICIANDO DEPLOY ==="

B=/var/www/inove-prime
S=/tmp/p/SISTEMA-GESTAO-INOVE/src

echo "Criando diretorios..."
mkdir -p "$B/app/(app)/rh/ponto"
mkdir -p "$B/app/(app)/rh/ferias"
mkdir -p "$B/app/(app)/rh/organograma"
mkdir -p "$B/app/(app)/rh/relatorios"

echo "Copiando arquivos..."
cp -rf "$S/app/." "$B/app/"
cp -rf "$S/components/." "$B/components/"

echo "Fazendo build..."
cd "$B"
npm run build

echo "Reiniciando servidor..."
pm2 restart inove-prime

echo ""
echo "=== DEPLOY CONCLUIDO ==="
