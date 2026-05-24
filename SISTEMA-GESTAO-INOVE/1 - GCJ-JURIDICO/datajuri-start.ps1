# DataJuri Dev Startup Script
$sourceDir = "y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri"
$devDir    = "C:\Users\sandr\AppData\Local\Temp\datajuri-dev"

Write-Host "DataJuri Dev Environment" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Sync source files
Write-Host "`nSincronizando arquivos..." -ForegroundColor Yellow
robocopy $sourceDir $devDir /E /XD "node_modules" ".next" /XF "*.log" /NFL /NDL /NJH /NJS /NC /NS | Out-Null
Write-Host "Sync concluido." -ForegroundColor Green

# Matar processo anterior na porta 3000, se houver
$existing = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Porta 3000 em uso — encerrando processo anterior..." -ForegroundColor Yellow
    Stop-Process -Id $existing.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# File watcher em background (sincroniza edicoes de X:\ para o devDir automaticamente)
$watcherScript = @"
`$source = '$sourceDir'
`$dest   = '$devDir'
`$watcher = New-Object System.IO.FileSystemWatcher
`$watcher.Path = `$source
`$watcher.Filter = '*'
`$watcher.IncludeSubdirectories = `$true
`$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::DirectoryName

`$action = {
    `$path = `$Event.SourceEventArgs.FullPath
    if (`$path -match '\\\\node_modules\\\\' -or `$path -match '\\\\.next\\\\') { return }
    `$rel      = `$path.Substring(`$source.Length)
    `$destPath = `$dest + `$rel
    `$changeType = `$Event.SourceEventArgs.ChangeType
    try {
        if (`$changeType -eq 'Deleted') {
            if (Test-Path `$destPath) { Remove-Item `$destPath -Force -ErrorAction SilentlyContinue }
        } else {
            `$destDir = Split-Path `$destPath -Parent
            if (-not (Test-Path `$destDir)) { New-Item -ItemType Directory -Path `$destDir -Force | Out-Null }
            Copy-Item -Path `$path -Destination `$destPath -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

Register-ObjectEvent `$watcher 'Changed' -Action `$action | Out-Null
Register-ObjectEvent `$watcher 'Created' -Action `$action | Out-Null
Register-ObjectEvent `$watcher 'Deleted' -Action `$action | Out-Null
Register-ObjectEvent `$watcher 'Renamed' -Action `$action | Out-Null
`$watcher.EnableRaisingEvents = `$true
while (`$true) { Start-Sleep -Seconds 2 }
"@

Start-Process powershell.exe -ArgumentList "-NoProfile -WindowStyle Hidden -Command $watcherScript" | Out-Null
Write-Host "File watcher ativo (sincroniza edicoes automaticamente)" -ForegroundColor Green

# Loop de reinicio automatico
Write-Host "`nServidor disponivel em: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar.`n" -ForegroundColor Gray

Set-Location $devDir

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Iniciando servidor Next.js..." -ForegroundColor Yellow
    & node "$devDir\node_modules\next\dist\bin\next" dev
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Servidor parou. Reiniciando em 5s... (Ctrl+C para cancelar)" -ForegroundColor Red
    Start-Sleep -Seconds 5
}
