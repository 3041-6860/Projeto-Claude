#!/bin/bash
set -e

echo ""
echo "=============================="
echo "  DEPLOY INOVE PRIME - AUTO"
echo "=============================="
echo ""

# 1. Clonar ou atualizar repositorio
if [ ! -d /tmp/p/.git ]; then
  echo "[1/5] Clonando repositorio..."
  rm -rf /tmp/p
  git clone https://github.com/3041-6860/Projeto-Claude.git /tmp/p
else
  echo "[1/5] Atualizando repositorio..."
  cd /tmp/p && git pull --rebase 2>/dev/null || true
fi

# 2. Encontrar diretorio fonte
echo "[2/5] Localizando arquivos..."
SRC=$(find /tmp/p -type d -name inove-prime 2>/dev/null | head -1)

if [ -z "$SRC" ]; then
  echo "ERRO: pasta inove-prime nao encontrada no repositorio"
  exit 1
fi

echo "      Fonte encontrada: $SRC"

# 3. Criar diretorios no servidor
echo "[3/5] Criando diretorios..."
mkdir -p "/var/www/inove-prime/app/(app)/rh/ponto"
mkdir -p "/var/www/inove-prime/app/(app)/rh/ferias"
mkdir -p "/var/www/inove-prime/app/(app)/rh/organograma"
mkdir -p "/var/www/inove-prime/app/(app)/rh/relatorios"
mkdir -p "/var/www/inove-prime/app/(app)/tarefas"
mkdir -p "/var/www/inove-prime/app/(app)/configuracoes"

# 4. Copiar todos os arquivos
echo "[4/5] Copiando arquivos..."
cp -rf "$SRC/app/." "/var/www/inove-prime/app/"
cp -rf "$SRC/components/." "/var/www/inove-prime/components/"
echo "      Arquivos copiados com sucesso!"

# 5. Build e reinicio
echo "[5/5] Fazendo build e reiniciando servidor..."
cd /var/www/inove-prime
npm run build

pm2 restart inove-prime

echo ""
echo "=============================="
echo "  DEPLOY CONCLUIDO!"
echo "=============================="
echo ""
