# Configura variables de entorno en Vercel (modo demo o producción).
# Requisitos: npx vercel login  (una sola vez)
#
# Uso:
#   .\scripts\configure-vercel-env.ps1 -Mode demo
#   .\scripts\configure-vercel-env.ps1 -Mode production -Origin "https://buildsss.vercel.app"

param(
  [ValidateSet('demo', 'production')]
  [string]$Mode = 'demo',
  [string]$Origin = 'https://buildsss.vercel.app',
  [string]$SupabaseUrl = 'https://tsflfahgkrpgrvwdejbv.supabase.co',
  [string]$SupabaseAnonKey = '',
  [string]$N8nBaseUrl = '',
  [string]$N8nWebhookUrl = '',
  [string]$N8nInternalToken = ''
)

function Add-VercelEnv {
  param([string]$Name, [string]$Value, [string[]]$Targets = @('production', 'preview', 'development'))
  foreach ($target in $Targets) {
    Write-Host "  $Name -> $target"
    $Value | npx vercel env add $Name $target --force 2>$null
    if ($LASTEXITCODE -ne 0) {
      Write-Error "No se pudo agregar $Name. ¿Ejecutaste 'npx vercel login' y 'npx vercel link'?"
      exit 1
    }
  }
}

Write-Host "Configurando Vercel ($Mode) para $Origin`n"

if ($Mode -eq 'demo') {
  Add-VercelEnv 'VITE_USE_MOCK' 'true'
  Add-VercelEnv 'APP_ALLOWED_ORIGIN' $Origin
  Write-Host "`nModo demo listo. Redeploy: npx vercel --prod"
  exit 0
}

if (-not $SupabaseAnonKey -or -not $N8nBaseUrl -or -not $N8nWebhookUrl -or -not $N8nInternalToken) {
  Write-Host @"

Modo production requiere parámetros adicionales:

  .\scripts\configure-vercel-env.ps1 -Mode production `
    -Origin "https://buildsss.vercel.app" `
    -SupabaseAnonKey "tu_clave_anon" `
    -N8nBaseUrl "https://tu-n8n.example.com" `
    -N8nWebhookUrl "https://tu-n8n.example.com/webhook/health/chat" `
    -N8nInternalToken "token-secreto-largo"

"@
  exit 1
}

Add-VercelEnv 'VITE_USE_MOCK' 'false'
Add-VercelEnv 'VITE_SUPABASE_URL' $SupabaseUrl
Add-VercelEnv 'VITE_SUPABASE_ANON_KEY' $SupabaseAnonKey
Add-VercelEnv 'N8N_BASE_URL' $N8nBaseUrl
Add-VercelEnv 'N8N_WEBHOOK_URL' $N8nWebhookUrl
Add-VercelEnv 'N8N_INTERNAL_TOKEN' $N8nInternalToken
Add-VercelEnv 'APP_ALLOWED_ORIGIN' $Origin

Write-Host "`nModo producción listo. Redeploy: npx vercel --prod"
