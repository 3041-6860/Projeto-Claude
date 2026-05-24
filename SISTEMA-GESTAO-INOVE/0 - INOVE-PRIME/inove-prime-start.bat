@echo off
echo ============================================
echo  Sistema Inove Prime — Iniciando...
echo ============================================

set SRC=y:\Projeto Claude\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime
set DEV=C:\Users\windows10\AppData\Local\Temp\inove-prime

echo Sincronizando arquivos...
robocopy "%SRC%" "%DEV%" /E /XD node_modules .next .git /NFL /NDL /NJH /NJS

echo Iniciando servidor em http://sistema.inoveprime.com.br:3000 ...
cd /d "%DEV%"
node node_modules\next\dist\bin\next dev --turbopack
