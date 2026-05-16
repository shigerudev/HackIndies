/**
 * Verifica MAKE_WEBHOOK_SECRET y opcionalmente el endpoint local.
 * Uso: cd backend && npm run test:make
 *      npm run test:make -- --ping   # requiere npm run dev en otra terminal
 */
import 'dotenv/config';

const secret = process.env.MAKE_WEBHOOK_SECRET;
const baseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';
const ping = process.argv.includes('--ping');

async function main() {
  console.log('--- NOMAD Centinela — Make.com webhook test ---\n');

  if (!secret || secret === 'your-make-webhook-secret') {
    console.error('FAIL: Set MAKE_WEBHOOK_SECRET in backend/.env');
    console.error('Generate one: openssl rand -hex 24  (or random string in PowerShell)');
    process.exit(1);
  }

  console.log('OK: MAKE_WEBHOOK_SECRET is set (' + secret.slice(0, 4) + '...' + secret.slice(-4) + ')');

  if (process.env.MAKE_API_TOKEN) {
    console.log('OK: MAKE_API_TOKEN present (REST client — Fase 2)');
  } else {
    console.log('Note: MAKE_API_TOKEN optional until outbound Make scenarios');
  }

  if (!ping) {
    console.log('\nTip: npm run test:make -- --ping  (with npm run dev running)');
    process.exit(0);
  }

  const res = await fetch(`${baseUrl}/api/webhooks/make/health`, {
    headers: { 'X-Nomad-Webhook-Secret': secret },
  });
  const body = await res.json();
  if (!res.ok) {
    console.error('\nFAIL: health', res.status, body);
    process.exit(1);
  }
  console.log('\nOK: webhook health', body);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
