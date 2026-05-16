# Configuración MCP — Cursor

## Supabase MCP

1. Crear Personal Access Token: https://supabase.com/dashboard/account/tokens
2. En Windows PowerShell (sesión de usuario):

```powershell
[System.Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', 'sbp_xxx', 'User')
```

3. Reiniciar Cursor para que cargue la variable.
4. Verificar en **Settings → MCP** que `supabase` aparece activo.
5. En Composer, probar: listar proyectos o ejecutar SQL de prueba.

El archivo [`.cursor/mcp.json`](../.cursor/mcp.json) ya referencia `${SUPABASE_ACCESS_TOKEN}`.

**No commitear** el token. Si se filtra, revocarlo en el dashboard.

## Make.com

No hay MCP oficial. Integración vía:

- Webhooks HTTP hacia `POST /api/webhooks/make/ingest`
- API REST de Make con token en `MAKE_API_TOKEN` (Fase 2)

Documentar escenarios en `docs/MAKE-SCENARIOS.md` (Fase 2).

## MiniMax

Sin MCP. Cliente HTTP en `backend/src/lib/minimax.ts` (Fase 1).

Variables: `MINIMAX_API_KEY`, `MINIMAX_BASE_URL` en `backend/.env`.
