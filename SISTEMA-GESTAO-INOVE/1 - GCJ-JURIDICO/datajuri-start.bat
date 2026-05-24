@echo off
title DataJuri Dev Server
set SOURCE=y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri
set DEVDIR=C:\Users\sandr\AppData\Local\Temp\datajuri-dev

echo [DataJuri] Syncing source files...
robocopy "%SOURCE%" "%DEVDIR%" /E /XD node_modules .next /XF *.log /NFL /NDL /NJH /NJS /NC /NS >nul 2>&1
echo [DataJuri] Sync complete.
echo [DataJuri] Server disponivel em http://localhost:3000
echo [DataJuri] Pressione Ctrl+C para parar.
echo.

:restart
echo [DataJuri] Iniciando servidor... %time%
cd /d "%DEVDIR%"
node "%DEVDIR%\node_modules\next\dist\bin\next" dev
echo.
echo [DataJuri] Servidor parou. Reiniciando em 5 segundos... (Ctrl+C para cancelar)
timeout /t 5 /nobreak >nul
goto restart
