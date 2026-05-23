#!/bin/bash
echo "=== CONFIGURANDO DEPLOY AUTOMATICO ==="

# 1. Criar repositorio permanente
echo "Criando repositorio permanente..."
rm -rf /root/inove-deploy
git clone https://github.com/3041-6860/Projeto-Claude.git /root/inove-deploy

# 2. Instalar script de auto-deploy
echo "Instalando script..."
cp /root/inove-deploy/SISTEMA-GESTAO-INOVE/auto-deploy.sh /root/auto-deploy.sh
chmod +x /root/auto-deploy.sh

# 3. Configurar cron para rodar a cada 5 minutos
echo "Configurando cron..."
echo "*/5 * * * * bash /root/auto-deploy.sh" > /tmp/mycron
crontab /tmp/mycron
rm /tmp/mycron

# 4. Verificar
echo "Cron configurado:"
crontab -l

echo ""
echo "=== PRONTO! Deploy automatico ativo ==="
echo "A cada 5 minutos o servidor verifica o GitHub."
echo "Log em: /root/deploy.log"
