# Aplica solo la migración 0002 (playbook FTS) al proyecto enlazado.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "SUPABASE_ACCESS_TOKEN no definido." -ForegroundColor Yellow
    Write-Host "Alternativa: pega supabase/migrations/0002_playbook_search.sql en Supabase SQL Editor."
    Write-Host "O define el token: [Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN','sbp_xxx','User')"
    exit 1
}

if (-not $env:SUPABASE_PROJECT_REF) {
    $env:SUPABASE_PROJECT_REF = "vjeqrhxfmaghpkkmjvaq"
    Write-Host "Usando SUPABASE_PROJECT_REF=$($env:SUPABASE_PROJECT_REF)"
}

npx supabase link --project-ref $env:SUPABASE_PROJECT_REF
npx supabase db push
Write-Host "OK: migraciones aplicadas (incluye 0002_playbook_search)."
