# Sincroniza variables de backend/.env a Vercel (production + preview).
# Uso: cd backend; ..\\scripts\\vercel-sync-env.ps1
$ErrorActionPreference = "Stop"
$BackendRoot = if (Test-Path ".env") { (Get-Location).Path } else { Join-Path (Split-Path (Split-Path $PSScriptRoot)) "backend" }
Set-Location $BackendRoot

$keys = @(
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MINIMAX_API_KEY",
  "MINIMAX_BASE_URL",
  "MINIMAX_MODEL",
  "MAKE_WEBHOOK_SECRET"
)

$envMap = @{}
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$' -and $_.Trim() -notmatch '^\#') {
    $envMap[$matches[1]] = $matches[2].Trim()
  }
}

foreach ($target in @("production", "preview")) {
  foreach ($key in $keys) {
    if (-not $envMap.ContainsKey($key)) { continue }
    Write-Host ">> $key ($target)"
  $envMap[$key] | npx vercel@latest env add $key $target --force 2>&1 | Out-Null
  }
}

Write-Host "OK: env vars synced to Vercel."
