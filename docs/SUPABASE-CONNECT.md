# Conectar Supabase — MCP y API

## Estado verificado en este repo

| Canal | Estado | Qué falta |
|-------|--------|-----------|
| **API (backend)** | No conectado | `backend/.env` con URL + `service_role` |
| **MCP (Cursor)** | No activo | Servidor no aparece en sesión; `SUPABASE_ACCESS_TOKEN` no definido |
| **CLI** | No autenticado | `supabase login` o variable `SUPABASE_ACCESS_TOKEN` |

---

## 1. API del backend (recomendado primero)

### A. Credenciales

Dashboard → **Project Settings** → **API**:

- `Project URL` → `SUPABASE_URL`
- `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Nunca uses `service_role` en web ni Flutter.

### B. Crear `backend/.env`

```bash
cd backend
cp .env.example .env
```

Editar `.env`:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
PORT=3001
```

### C. Aplicar schema y seed

Si el proyecto está vacío, en **SQL Editor** ejecutar en orden:

1. Contenido de `supabase/migrations/0001_init.sql`
2. Contenido de `supabase/seed.sql`

O con CLI (tras `npx supabase login` y `npx supabase link --project-ref TU_REF`):

```bash
npx supabase db push
# seed manual en SQL Editor o psql
```

### D. Probar

```bash
cd backend
npm run test:supabase
npm run dev
```

`GET http://localhost:3001/api/health` debe mostrar `"supabase": true, "mock": false`.

---

## 2. MCP en Cursor

### A. Personal Access Token (cuenta Supabase, no del proyecto)

https://supabase.com/dashboard/account/tokens → Generate token

### B. Variable de entorno (Windows)

```powershell
[System.Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', 'sbp_xxxx', 'User')
```

Reiniciar Cursor por completo.

### C. Habilitar MCP

**Cursor Settings → Features → MCP** → activar servidor `supabase` (definido en `.cursor/mcp.json`).

Si no aparece, verificar que el archivo existe en la raíz del workspace `.cursor/mcp.json`.

### D. Verificar

En Composer, el agente debería poder listar proyectos o ejecutar SQL. Prueba en terminal:

```bash
npx supabase projects list
```

(con el mismo token exportado en la sesión)

---

## 3. Enlazar CLI y aplicar migraciones (automático)

Desde la raíz del repo, con token y project ref:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx"
$env:SUPABASE_PROJECT_REF = "tu-reference-id"
.\scripts\supabase-deploy.ps1
```

O manualmente:

```bash
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
npx supabase db query --file supabase/seed.sql --linked
```

`TU_PROJECT_REF` está en Dashboard → Project Settings → General → **Reference ID**.

---

## Checklist rápido

- [ ] Proyecto Supabase activo (no pausado)
- [ ] `backend/.env` creado
- [ ] Migración + seed aplicados
- [ ] `npm run test:supabase` → OK
- [ ] `npm run dev` → health sin mock
- [ ] (Opcional) PAT + MCP en Cursor
- [ ] (Opcional) `supabase link` para CLI
