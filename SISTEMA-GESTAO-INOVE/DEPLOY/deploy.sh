#!/bin/bash
D=/home2/gcjadv86/deploy
B=/var/www/inove-prime
A="$B/app/(app)"

echo "Criando diretorios..."
mkdir -p "$A/rh/ponto"
mkdir -p "$A/rh/ferias"
mkdir -p "$A/rh/organograma"
mkdir -p "$A/rh/relatorios"

echo "Copiando arquivos..."
cp $D/globals.css $B/app/globals.css
cp $D/dashboard.tsx "$A/dashboard/page.tsx"
cp $D/negocios.tsx "$A/negocios/page.tsx"
cp $D/marketing.tsx "$A/marketing/page.tsx"
cp $D/configuracoes.tsx "$A/configuracoes/page.tsx"
cp $D/rh.tsx "$A/rh/page.tsx"
cp $D/ponto.tsx "$A/rh/ponto/page.tsx"
cp $D/ferias.tsx "$A/rh/ferias/page.tsx"
cp $D/organograma.tsx "$A/rh/organograma/page.tsx"
cp $D/tarefas.tsx "$A/tarefas/page.tsx"
cp $D/relatorios.tsx "$A/rh/relatorios/page.tsx"
cp $D/Sidebar.tsx $B/components/Sidebar.tsx

echo "Fazendo build..."
cd $B
npm run build

echo "Reiniciando servidor..."
pm2 restart inove-prime

echo ""
echo "DEPLOY CONCLUIDO!"
