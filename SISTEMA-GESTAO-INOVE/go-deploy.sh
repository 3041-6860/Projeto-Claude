#!/bin/bash
REPO=${1:-/root/inove-deploy}
B=/var/www/inove-prime
S=$REPO/SISTEMA-GESTAO-INOVE/src

echo "Criando diretorios..."
mkdir -p "$B/app/(app)/crm/leads"
mkdir -p "$B/app/(app)/rh/ponto"
mkdir -p "$B/app/(app)/rh/ferias"
mkdir -p "$B/app/(app)/rh/organograma"
mkdir -p "$B/app/(app)/rh/relatorios"
mkdir -p "$B/app/(app)/calendario"
mkdir -p "$B/app/(app)/documentos"
mkdir -p "$B/app/(app)/feed"
mkdir -p "$B/app/(app)/financeiro"
mkdir -p "$B/app/(app)/mensagens"
mkdir -p "$B/app/(app)/negocios/pipelines"
mkdir -p "$B/app/(app)/negocios/gcj-juridico"
mkdir -p "$B/app/(app)/onboarding"
mkdir -p "$B/app/(app)/processos/monitoramento"
mkdir -p "$B/app/login"
mkdir -p "$B/app/actions"
mkdir -p "$B/public"

echo "Copiando arquivos..."
cp -rf "$S/app/." "$B/app/"
cp -rf "$S/components/." "$B/components/"
if [ -d "$S/public" ]; then cp -rf "$S/public/." "$B/public/"; fi

echo "Fazendo build..."
cd "$B"
npm run build 2>&1

echo "Reiniciando servidor..."
pm2 restart inove-prime

echo "=== DEPLOY CONCLUIDO ==="
