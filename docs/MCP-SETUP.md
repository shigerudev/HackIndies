# Configuración MCP — Cursor

## Checklist rápido (post-reinicio)

| Servidor | Variable / auth | ¿En `.cursor/mcp.json`? | Cómo verificar |
|----------|-----------------|-------------------------|----------------|
| **vercel** | OAuth (login en Cursor) | Sí | Settings → MCP → `vercel` → *Needs login* → autorizar |
| **v0** | `V0_API_KEY` (User) | Sí | Misma pantalla → `v0` en verde |
| **supabase** | `SUPABASE_ACCESS_TOKEN` (User) | Sí | Misma pantalla → `supabase` en verde |

PowerShell (nueva ventana):

```powershell
[System.Environment]::GetEnvironmentVariable('V0_API_KEY', 'User')
[System.Environment]::GetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', 'User')
```

Si alguna sale vacía, configurarla y **reiniciar Cursor** otra vez.

**Nota:** `v0` (generación UI) y `vercel` (deploy/docs de Vercel) son **dos MCP distintos**.  
Make.com no tiene MCP oficial — se conecta solo por HTTP (ver `docs/MAKE-CONNECT.md` y `docs/MAKE-API.md`).

## Vercel MCP (deploy y documentación)

OAuth — no usa variable de entorno.

1. [`.cursor/mcp.json`](../.cursor/mcp.json) incluye `"vercel": { "url": "https://mcp.vercel.com" }`.
2. Reiniciar Cursor si acabas de reinstalar.
3. **Settings → MCP** → servidor `vercel` → clic en **Needs login** → iniciar sesión en Vercel.
4. Probar en Composer: *“Lista mis proyectos en Vercel”* o *“Busca en la documentación de Vercel cómo configurar env vars”*.

Instalación alternativa: `npx add-mcp https://mcp.vercel.com -y`

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

## v0 MCP (UI / componentes)

Generación de UI desde Cursor vía el servidor remoto de v0. No usa `backend/.env`.

1. Crear API key: https://v0.app/chat/settings/keys
2. En Windows PowerShell (variable de **usuario**; dejar `'User'` literal, no es tu nombre):

```powershell
[System.Environment]::SetEnvironmentVariable('V0_API_KEY', 'v0_xxx', 'User')
```

3. Verificar (nueva ventana de PowerShell):

```powershell
[System.Environment]::GetEnvironmentVariable('V0_API_KEY', 'User')
```

4. Reiniciar Cursor.
5. **Settings → MCP** → `v0` debe aparecer activo.

[`.cursor/mcp.json`](../.cursor/mcp.json) usa `mcp-remote` → `https://mcp.v0.dev` con header `Authorization: Bearer ${V0_API_KEY}`.

**No commitear** la key. Revocar en v0 si se filtra.

Uso típico en Composer: crear un chat v0 para una pantalla de `web/` (Next.js 15, Tailwind 4), luego integrar el código generado en el repo.

## Make.com

No hay MCP oficial. Integración vía HTTP — ver [`docs/MAKE-CONNECT.md`](MAKE-CONNECT.md).

- `POST /api/webhooks/make/ingest` + header `X-Nomad-Webhook-Secret`
- `MAKE_WEBHOOK_SECRET` en `backend/.env`
- `MAKE_API_TOKEN` opcional (escenarios salientes, Fase 2)

## MiniMax

Sin MCP. Cliente HTTP en `backend/src/lib/minimax.ts` (Fase 1).

Variables: `MINIMAX_API_KEY`, `MINIMAX_BASE_URL` en `backend/.env`.
