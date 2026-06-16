# Avroz Games Marketplace — Configuração de Produção
# Execute: .\scripts\setup-production.ps1

param(
    [string]$SupabaseUrl,
    [string]$SupabaseAnonKey,
    [switch]$SkipGitHubSecrets
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

Write-Host ""
Write-Host "=== Avroz Games — Setup Producao ===" -ForegroundColor Cyan
Write-Host ""

# 1. .env local
$envFile = Join-Path $root ".env"
$exampleFile = Join-Path $root ".env.example"

if (-not $SupabaseUrl) {
    Write-Host "Supabase (Settings > API):" -ForegroundColor White
    $SupabaseUrl = Read-Host "VITE_SUPABASE_URL"
}
if (-not $SupabaseAnonKey) {
    $SupabaseAnonKey = Read-Host "VITE_SUPABASE_ANON_KEY"
}

if (-not $SupabaseUrl -or -not $SupabaseAnonKey) {
    Write-Host "URL e anon key sao obrigatorios." -ForegroundColor Red
    exit 1
}

@"
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey
"@ | Set-Content -Path $envFile -Encoding UTF8
Write-Host "[OK] .env criado" -ForegroundColor Green

# 2. GitHub Secrets
if (-not $SkipGitHubSecrets) {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if ($gh) {
        $auth = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Configurando GitHub Secrets..." -ForegroundColor Cyan
            gh secret set VITE_SUPABASE_URL -R "Avroz-Games/avroz-games.github.io" -b $SupabaseUrl
            gh secret set VITE_SUPABASE_ANON_KEY -R "Avroz-Games/avroz-games.github.io" -b $SupabaseAnonKey
            Write-Host "[OK] Secrets configurados no GitHub" -ForegroundColor Green
        } else {
            Write-Host "[AVISO] gh nao autenticado. Execute: gh auth login" -ForegroundColor Yellow
            Write-Host "Depois configure secrets manualmente (veja docs/DEPLOY.md)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[AVISO] GitHub CLI nao instalado. Configure secrets manualmente." -ForegroundColor Yellow
    }
}

# 3. Build test
Write-Host ""
Write-Host "Testando build..." -ForegroundColor Cyan
Push-Location $root
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build falhou!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "[OK] Build passou" -ForegroundColor Green

Write-Host ""
Write-Host "=== Proximos passos no Supabase SQL Editor ===" -ForegroundColor Cyan
Write-Host "  1. supabase/schema.sql"
Write-Host "  2. supabase/storage.sql"
Write-Host "  3. supabase/seed.sql"
Write-Host ""
Write-Host "Crie admin em Authentication > Users: admin@avrozgames.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploy: git push origin main" -ForegroundColor Green
Write-Host "Site: https://avroz-games.github.io/" -ForegroundColor Green
Write-Host ""
