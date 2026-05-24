# Script para preparar pasta de deploy
$src = "X:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\0 - INOVE-PRIME\inove-prime"
$dst = "X:\PROJETO CLAUDE\SISTEMA-GESTAO-INOVE\DEPLOY"

New-Item -ItemType Directory -Force $dst | Out-Null

Copy-Item "$src\app\globals.css"                          "$dst\globals.css"
Copy-Item "$src\app\(app)\dashboard\page.tsx"             "$dst\dashboard.tsx"
Copy-Item "$src\app\(app)\negocios\page.tsx"              "$dst\negocios.tsx"
Copy-Item "$src\app\(app)\marketing\page.tsx"             "$dst\marketing.tsx"
Copy-Item "$src\app\(app)\configuracoes\page.tsx"         "$dst\configuracoes.tsx"
Copy-Item "$src\app\(app)\rh\page.tsx"                    "$dst\rh.tsx"
Copy-Item "$src\app\(app)\rh\ponto\page.tsx"              "$dst\ponto.tsx"
Copy-Item "$src\app\(app)\rh\ferias\page.tsx"             "$dst\ferias.tsx"
Copy-Item "$src\app\(app)\rh\organograma\page.tsx"        "$dst\organograma.tsx"
Copy-Item "$src\app\(app)\tarefas\page.tsx"               "$dst\tarefas.tsx"
Copy-Item "$src\app\(app)\rh\relatorios\page.tsx"         "$dst\relatorios.tsx"
Copy-Item "$src\components\Sidebar.tsx"                   "$dst\Sidebar.tsx"

Write-Host "Arquivos copiados para: $dst"
Write-Host "Total de arquivos:"
(Get-ChildItem $dst).Count
