/**
 * Crea escenarios Make.com vía API REST (sin tocar UI).
 *
 * Requiere en backend/.env:
 *   MAKE_API_TOKEN     — Personal API Token de Make (us2)
 *   MAKE_API_ZONE      — eu1 | eu2 | us1 | us2
 *   MAKE_TEAM_ID       — ID numérico del team (lo descubrimos automáticamente)
 *   MAKE_WEBHOOK_SECRET — el mismo que valida el backend
 *
 * Uso:
 *   cd backend && npm run make:create                    # solo ingesta
 *   cd backend && npm run make:create -- --notify         # ingesta + HTTP notify (Discord/Slack webhook)
 *   cd backend && npm run make:create -- --email         # ingesta + email HITL (requiere GMAIL_CONNECTION_ID)
 *   cd backend && npm run make:create -- --all           # ingesta + HTTP notify + email
 *
 * Param --email puede recibir el connection ID como override:
 *   cd backend && npm run make:create -- --email 8907259
 */
import 'dotenv/config';

type Json = Record<string, unknown>;

const ZONE = (process.env.MAKE_API_ZONE ?? 'us2').toLowerCase();
const BASE = `https://${ZONE}.make.com/api/v2`;
const TOKEN = process.env.MAKE_API_TOKEN ?? '';
const TEAM_ID_ENV = process.env.MAKE_TEAM_ID;
const SECRET = process.env.MAKE_WEBHOOK_SECRET ?? '';
const BACKEND_URL =
  process.env.NOMAD_API_URL ?? 'https://nomad-centinela-api.vercel.app';

const WANT_NOTIFY = process.argv.includes('--notify');
const WANT_EMAIL = process.argv.includes('--email');
const NOTIFY_WEBHOOK_URL =
  process.env.NOTIFY_WEBHOOK_URL ?? ''; // Discord o Slack incoming webhook URL

// Gmail connection ID: lo descubrimos automáticamente o lo pasa el usuario
function getGmailConnectionId(): number {
  const override = process.argv.find((a) => a.startsWith('--email='));
  if (override) return Number(override.split('=')[1]);
  return 8907259; // default descubierto: My Gmail connection
}

function die(msg: string, extra?: unknown): never {
  console.error('FAIL:', msg);
  if (extra) console.error(extra);
  process.exit(1);
}

if (!TOKEN) die('MAKE_API_TOKEN no seteado en backend/.env');
if (!SECRET) die('MAKE_WEBHOOK_SECRET no seteado en backend/.env');

async function mk<T = Json>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Token ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.text();
  if (!res.ok) {
    die(`Make API ${res.status} ${path}`, body);
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    return body as unknown as T;
  }
}

async function resolveTeamId(): Promise<number> {
  if (TEAM_ID_ENV) return Number(TEAM_ID_ENV);
  const { teams } = await mk<{ teams: Array<{ id: number; name: string }> }>(
    '/teams?organizationId=',
  );
  if (!teams?.length) die('No se encontraron teams en tu cuenta Make');
  const first = teams[0];
  console.log(`Team detectado: ${first.name} (id=${first.id}). Persistilo en MAKE_TEAM_ID.`);
  return first.id;
}

async function createHook(teamId: number, name: string): Promise<{ id: number; url: string }> {
  const res = await mk<{ hook: { id: number; url: string } }>(
    `/hooks?teamId=${teamId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        teamId,
        typeName: 'gateway-webhook',
        method: false,
        header: false,
        stringify: false,
        headers: [], // required when method=true but we use method=false
      }),
    },
  );
  return res.hook;
}

function blueprintIngest(hookId: number) {
  return {
    name: 'NOMAD Centinela - Ingesta OSINT sintética',
    flow: [
      {
        id: 1,
        module: 'gateway:CustomWebHook',
        version: 1,
        parameters: { hook: hookId, maxResults: 1 },
        mapper: {},
        metadata: {
          designer: { x: 0, y: 0 },
          restore: { parameters: { hook: { label: 'NOMAD ingest hook' } } },
          parameters: [
            { name: 'hook', type: 'hook:gateway-webhook', label: 'Webhook', required: true },
            { name: 'maxResults', type: 'number', label: 'Max results' },
          ],
          interface: [
            { name: 'institution_slug', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'summary', type: 'text' },
            { name: 'severity', type: 'text' },
            { name: 'external_id', type: 'text' },
          ],
        },
      },
      {
        id: 2,
        module: 'http:ActionSendData',
        version: 3,
        parameters: { handleErrors: true, useNewZLibDeCompress: true },
        mapper: {
          url: `${BACKEND_URL}/api/webhooks/make/ingest`,
          serializeUrl: false,
          method: 'post',
          headers: [
            { name: 'X-Nomad-Webhook-Secret', value: SECRET },
            { name: 'Content-Type', value: 'application/json' },
          ],
          qs: [],
          bodyType: 'raw',
          parseResponse: true,
          authUser: '',
          authPass: '',
          timeout: '',
          shareCookies: false,
          ca: '',
          rejectUnauthorized: true,
          followRedirect: true,
          useQuerystring: false,
          gzip: true,
          useMtls: false,
          contentType: 'application/json',
          data: JSON.stringify({
            institution_slug: '{{1.institution_slug}}',
            title: '{{1.title}}',
            summary: '{{1.summary}}',
            severity: '{{1.severity}}',
            external_id: '{{1.external_id}}',
          }),
          followAllRedirects: false,
        },
        metadata: {
          designer: { x: 300, y: 0 },
          restore: {},
          expect: [
            { name: 'url', type: 'url', label: 'URL', required: true },
            { name: 'method', type: 'select', label: 'Method' },
          ],
        },
      },
    ],
    metadata: {
      instant: false,
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        autoCommitTriggerLast: true,
        sequential: false,
        confidential: false,
        dataloss: false,
        dlq: false,
        freshVariables: false,
      },
      designer: { orphans: [] },
      zone: `${ZONE}.make.com`,
    },
  };
}

function blueprintNotify(hookId: number) {
  if (!NOTIFY_WEBHOOK_URL) {
    die(
      'NOTIFY_WEBHOOK_URL no definido. Pasa --notify y exporta una URL de Discord/Slack incoming webhook.',
    );
  }
  return {
    name: 'NOMAD Centinela - HITL notify',
    flow: [
      {
        id: 1,
        module: 'gateway:CustomWebHook',
        version: 1,
        parameters: { hook: hookId, maxResults: 1 },
        mapper: {},
        metadata: {
          designer: { x: 0, y: 0 },
          interface: [
            { name: 'event_id', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'severity', type: 'text' },
            { name: 'institution_name', type: 'text' },
          ],
        },
      },
      {
        id: 2,
        module: 'http:ActionSendData',
        version: 3,
        parameters: { handleErrors: true },
        mapper: {
          url: NOTIFY_WEBHOOK_URL,
          method: 'post',
          headers: [{ name: 'Content-Type', value: 'application/json' }],
          qs: [],
          bodyType: 'raw',
          parseResponse: true,
          contentType: 'application/json',
          data: JSON.stringify({
            content:
              '🔔 **NOMAD Centinela — HITL pending_review**\n' +
              'Evento: {{1.title}}\nSeveridad: {{1.severity}}\n' +
              'Institución: {{1.institution_name}}\n' +
              `Dashboard: https://nomad-centinela-web.vercel.app/events/{{1.event_id}}`,
          }),
          rejectUnauthorized: true,
          followRedirect: true,
          gzip: true,
        },
        metadata: { designer: { x: 300, y: 0 } },
      },
    ],
    metadata: {
      instant: false,
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        autoCommitTriggerLast: true,
        sequential: false,
        confidential: false,
        dataloss: false,
        dlq: false,
        freshVariables: false,
      },
      designer: { orphans: [] },
      zone: `${ZONE}.make.com`,
    },
  };
}

function blueprintEmail(hookId: number, connectionId: number, toEmail: string) {
  return {
    name: 'NOMAD Centinela - HITL email',
    flow: [
      {
        id: 1,
        module: 'gateway:CustomWebHook',
        version: 1,
        parameters: { hook: hookId, maxResults: 1 },
        mapper: {},
        metadata: {
          designer: { x: 0, y: 0 },
          interface: [
            { name: 'event_id', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'severity', type: 'text' },
            { name: 'institution_name', type: 'text' },
          ],
        },
      },
      {
        id: 2,
        module: 'google-email:ActionSendEmail',
        version: 1,
        parameters: { handleErrors: true },
        mapper: {
          to: toEmail,
          subject: `🔔 [NOMAD Centinela] Nuevo evento pending_review: {{1.title}} ({{1.severity}})`,
          body: `Evento: {{1.title}}\nSeveridad: {{1.severity}}\nInstitución: {{1.institution_name}}\n\nRevisar: https://nomad-centinela-web.vercel.app/events/{{1.event_id}}`,
          connectionId: String(connectionId),
          replyTo: '',
          nameFrom: 'NOMAD Centinela',
          htmlBody: false,
          attachments: [],
        },
        metadata: {
          designer: { x: 300, y: 0 },
          restore: { parameters: { connectionId: { label: 'My Gmail connection' } } },
          expect: [{ name: 'connectionId', type: 'connection:email', label: 'Email connection' }],
        },
      },
    ],
    metadata: {
      instant: false,
      version: 1,
      scenario: {
        roundtrips: 1,
        maxErrors: 3,
        autoCommit: true,
        autoCommitTriggerLast: true,
        sequential: false,
        confidential: false,
        dataloss: false,
        dlq: false,
        freshVariables: false,
      },
      designer: { orphans: [] },
      zone: `${ZONE}.make.com`,
    },
  };
}

async function createScenario(teamId: number, name: string, blueprint: Json) {
  const res = await mk<{ scenario: { id: number; name: string; hookId?: number } }>(
    `/scenarios?confirmed=true`,
    {
      method: 'POST',
      body: JSON.stringify({
        teamId,
        blueprint: JSON.stringify(blueprint),
        scheduling: JSON.stringify({ type: 'on-demand' }),
        name,
      }),
    },
  );
  return res.scenario;
}

async function activateScenario(scenarioId: number) {
  await mk(`/scenarios/${scenarioId}/start`, { method: 'POST' });
}

async function main() {
  console.log(`--- Make.com scenario creator (zone=${ZONE}) ---`);
  const teamId = await resolveTeamId();

  console.log('\n[1/3] Creando hook de ingesta…');
  const ingestHook = await createHook(teamId, 'NOMAD ingest hook');
  console.log(`Hook ingesta listo: id=${ingestHook.id}`);
  console.log(`  URL del trigger (para invocar): ${ingestHook.url}`);

  console.log('\n[2/3] Creando escenario de ingesta…');
  const ingestScn = await createScenario(
    teamId,
    'NOMAD Centinela - Ingesta OSINT sintética',
    blueprintIngest(ingestHook.id),
  );
  await activateScenario(ingestScn.id);
  console.log(`Escenario ingesta activo: id=${ingestScn.id}`);

  let notifyHookUrl = '';
  if (WANT_NOTIFY) {
    console.log('\n[3/3] Creando hook + escenario de HITL notify…');
    const notifyHook = await createHook(teamId, 'NOMAD HITL notify hook');
    const notifyScn = await createScenario(
      teamId,
      'NOMAD Centinela - HITL notify',
      blueprintNotify(notifyHook.id),
    );
    await activateScenario(notifyScn.id);
    console.log(`Escenario notify activo: id=${notifyScn.id}`);
    console.log(`URL trigger (llamar desde backend): ${notifyHook.url}`);
    notifyHookUrl = notifyHook.url;
  } else if (WANT_EMAIL) {
    const gmailConnId = getGmailConnectionId();
    const toEmail = process.env.NOTIFY_EMAIL ?? 'z648s.7bt@gmail.com';
    console.log('\n[3/3] Creando hook + escenario de HITL email…');
    const emailHook = await createHook(teamId, 'NOMAD HITL email hook');
    const emailScn = await createScenario(
      teamId,
      'NOMAD Centinela - HITL email',
      blueprintEmail(emailHook.id, gmailConnId, toEmail),
    );
    await activateScenario(emailScn.id);
    console.log(`Escenario email activo: id=${emailScn.id}`);
    console.log(`URL trigger (llamar desde backend): ${emailHook.url}`);
    console.log(`Enviando a: ${toEmail} (connectionId=${gmailConnId})`);
    notifyHookUrl = emailHook.url;
  } else {
    console.log('\n[3/3] --notify/--email no pasado; omito escenario HITL.');
  }

  console.log('\nOK. Verificar en:');
  console.log(`https://${ZONE}.make.com/${teamId}/scenarios`);
  console.log(`\nProbar ingesta:`);
  console.log(`curl -X POST "${ingestHook.url}" \\`);
  console.log(
    `  -H "Content-Type: application/json" \\`,
  );
  console.log(
    `  -d '{"institution_slug":"digecam","title":"[Sintético] desde Make API","severity":"high","external_id":"make-api-001"}'`,
  );
  if (notifyHookUrl) {
    console.log(`\nProbar notify:`);
    console.log(`curl -X POST "${notifyHookUrl}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"event_id":"abc","title":"test","severity":"high","institution_name":"DIGECAM"}'`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
