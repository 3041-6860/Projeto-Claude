#!/bin/bash
REPO=${1:-/root/inove-deploy}
B=/var/www/inove-prime
S=$REPO/SISTEMA-GESTAO-INOVE/src

echo "=== LIMPANDO BUILD ANTIGO ==="
rm -rf "$B/.next"
rm -f /var/www/package-lock.json

echo "=== CRIANDO DIRETORIOS ==="
mkdir -p "$B/app/(app)/crm/leads"
mkdir -p "$B/app/(app)/rh/ponto" "$B/app/(app)/rh/ferias"
mkdir -p "$B/app/(app)/rh/organograma" "$B/app/(app)/rh/relatorios"
mkdir -p "$B/app/(app)/calendario" "$B/app/(app)/documentos"
mkdir -p "$B/app/(app)/feed" "$B/app/(app)/financeiro"
mkdir -p "$B/app/(app)/mensagens" "$B/app/(app)/onboarding"
mkdir -p "$B/app/(app)/negocios/pipelines" "$B/app/(app)/negocios/gcj-juridico"
mkdir -p "$B/app/(app)/processos/monitoramento"
mkdir -p "$B/app/login" "$B/app/actions" "$B/public"

echo "=== COPIANDO ARQUIVOS ==="
cp -rf "$S/app/." "$B/app/"
cp -rf "$S/components/." "$B/components/"
if [ -d "$S/public" ]; then cp -rf "$S/public/." "$B/public/"; fi

echo "=== FAZENDO BUILD ==="
cd "$B"
npm run build

echo "=== REINICIANDO ==="
pm2 restart inove-prime

echo "=== DEPLOY CONCLUIDO ==="
