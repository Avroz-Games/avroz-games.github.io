# Avroz Games — Script de configuração local
# Execute: .\scripts\configure.ps1

Write-Host ""
Write-Host "=== Avroz Games — Configuracao ===" -ForegroundColor Cyan
Write-Host ""

$envFile = Join-Path $PSScriptRoot ".." ".env"
$exampleFile = Join-Path $PSScriptRoot ".." ".env.example"

if (Test-Path $envFile) {
    Write-Host "Arquivo .env ja existe." -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja reconfigurar? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "Cancelado."
        exit 0
    }
}

Write-Host ""
Write-Host "Passo 1: Crie um projeto em https://supabase.com" -ForegroundColor White
Write-Host "Passo 2: Va em Settings > API e copie URL e anon key" -ForegroundColor White
Write-Host ""

$url = Read-Host "VITE_SUPABASE_URL (ex: https://xxx.supabase.co)"
$key = Read-Host "VITE_SUPABASE_ANON_KEY"

if (-not $url -or -not $key) {
    Write-Host "URL e chave sao obrigatorios." -ForegroundColor Red
    exit 1
}

@"
VITE_SUPABASE_URL=$url
VITE_SUPABASE_ANON_KEY=$key
"@ | Set-Content -Path $envFile -Encoding UTF8

Write-Host ""
Write-Host "Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos no Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host "  1. Execute supabase/schema.sql"
Write-Host "  2. Execute supabase/storage.sql"
Write-Host "  3. Execute supabase/seed.sql"
Write-Host ""
Write-Host "Crie um usuario admin em Authentication > Users" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para GitHub Pages, adicione os secrets no repositorio:" -ForegroundColor Cyan
Write-Host "  Settings > Secrets > Actions"
Write-Host "  - VITE_SUPABASE_URL"
Write-Host "  - VITE_SUPABASE_ANON_KEY"
Write-Host ""
Write-Host "Reinicie o servidor: npm run dev" -ForegroundColor Green
