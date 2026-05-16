# Aplica migraciones + seed al proyecto Supabase cloud enlazado.
# Uso (PowerShell):
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
#   $env:SUPABASE_PROJECT_REF = "abcdefghijklmnop"
#   .\scripts\supabase-deploy.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Error "Falta SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)"
}
if (-not $env:SUPABASE_PROJECT_REF) {
    Write-Error "Falta SUPABASE_PROJECT_REF (Dashboard → Project Settings → General → Reference ID)"
}

Write-Host ">> Enlazando proyecto $($env:SUPABASE_PROJECT_REF)..."
npx supabase link --project-ref $env:SUPABASE_PROJECT_REF

Write-Host ">> Aplicando migraciones (supabase/migrations)..."
npx supabase db push

Write-Host ">> Aplicando seed (supabase/seed.sql)..."
npx supabase db query --file supabase/seed.sql --linked

Write-Host ">> Listo. Verifica en Table Editor: institutions (8 filas)."
Write-Host ">> Siguiente: copia SUPABASE_URL y service_role a backend/.env y ejecuta: cd backend; npm run test:supabase"
