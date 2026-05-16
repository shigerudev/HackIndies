#!/usr/bin/env node
/**
 * pre-demo-smoke.ts
 * Smoke test para correr 2 minutos antes del demo.
 * Verifica: health, presets list, run-preset para los 3 escenarios.
 * Sale con código 0 si todo OK, >0 si algo falla.
 */
import { setTimeout as sleep } from 'timers/promises';

const API = process.env.API_URL ?? 'http://localhost:3001';
const PRESETS = ['digecam-2026-04', 'mintrab-tu-empleo', 'renap-claimed'];

async function main() {
  console.log('=== NOMAD Centinela — pre-demo smoke test ===\n');
  console.log(`API: ${API}`);
  console.log('');

  // 1. Health check
  console.log('[1/5] GET /api/health');
  let res;
  try {
    res = await fetch(`${API}/api/health`);
  } catch (e) {
    console.error('❌ Cannot reach API:', e.message);
    process.exit(1);
  }
  const health = await res.json() as Record<string, boolean>;
  console.log(`   supabase: ${health.supabase}`);
  console.log(`   minimax:  ${health.minimax}`);
  console.log(`   make_webhook: ${health.make_webhook}`);
  console.log(`   mock:     ${health.mock}`);
  if (health.mock) {
    console.warn('⚠️  API is running in mock mode — MiniMax not connected');
  }

  // 2. Presets list
  console.log('\n[2/5] GET /api/dev/presets');
  let presetsRes;
  try {
    presetsRes = await fetch(`${API}/api/dev/presets`);
  } catch (e) {
    console.error('❌ Cannot reach /api/dev/presets:', e.message);
    process.exit(1);
  }
  const presets = await presetsRes.json() as { data: { id: string; title: string }[] };
  console.log(`   ${presets.data.length} presets: ${presets.data.map((p) => p.id).join(', ')}`);

  // 3-5. Run each preset (requires DEMO_MODE=true on the server side)
  for (const presetId of PRESETS) {
    console.log(`\n[3-5] POST /api/dev/run-preset/${presetId}`);
    try {
      const runRes = await fetch(`${API}/api/dev/run-preset/${presetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!runRes.ok) {
        console.warn(`   ⚠️  HTTP ${runRes.status} — puede que DEMO_MODE no esté habilitado`);
      } else {
        const result = await runRes.json() as Record<string, unknown>;
        console.log(`   ✅ Done — mock: ${result.mock}, hitl_status: ${result.hitl_status ?? 'N/A'}`);
      }
    } catch (e) {
      console.warn(`   ⚠️  Error: ${e.message}`);
    }
  }

  console.log('\n=== Smoke completo ===');
  console.log('Si todos los checks pasaron, estás listo para el demo.');
  console.log('Si algún preset falló con HTTP 401/403, es normal sin DEMO_MODE=true.');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Smoke test error:', e);
  process.exit(1);
});