'use client';

import { useState } from 'react';
import { Section } from '@/components/playground/Section';
import { EndpointCard } from '@/components/playground/EndpointCard';
import { CodeBlock } from '@/components/playground/CodeBlock';
import { FtsVsVector } from '@/components/playground/FtsVsVector';
import {
  fetchHealth,
  fetchInstitutions,
  checkCitizen,
  fetchPlaybook,
  makeIngest,
  runPipeline,
  citizenAgentChat,
} from '@/lib/playground-api';
import { fetchEvents, runTriage, runInvestigate, searchPlaybooks, API_URL } from '@/lib/api';

const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_SECRET ?? '';

const snips = (path: string, body?: string) => [
  {
    lang: 'curl',
    label: 'curl',
    code: body
      ? `curl -X POST ${API_URL}${path} \\
  -H "Content-Type: application/json" \\
  -d '${body}'`
      : `curl -s ${API_URL}${path} | jq`,
  },
  {
    lang: 'typescript',
    label: 'Next.js',
    code: body
      ? `const res = await fetch(\`${API_URL}${path}\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${body}),
});
const json = await res.json();`
      : `const res = await fetch(\`${API_URL}${path}\`, { cache: 'no-store' });
const json = await res.json();`,
  },
  {
    lang: 'dart',
    label: 'Flutter',
    code: body
      ? `final resp = await http.post(
  Uri.parse('${API_URL}${path}'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode(${body}),
);`
      : `final resp = await http.get(Uri.parse('${API_URL}${path}'));`,
  },
];

export default function PlaygroundPage() {
  const [eventsCache, setEventsCache] = useState<{ id: string; title: string }[]>([]);

  async function loadEventsForSelect() {
    const data = await fetchEvents();
    setEventsCache(data.data.map((e: { id: string; title: string }) => ({ id: e.id, title: e.title })));
    return data;
  }

  const cardStyles = 'grid grid-cols-1 md:grid-cols-2 gap-4';

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      {/* HERO */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono bg-cyan-900 text-cyan-300 px-2 py-1 rounded">
              Track Def/Acc · hack@latam
            </span>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded">
              API: {API_URL}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            NOMAD Centinela
          </h1>
          <p className="text-lg text-cyan-400 font-semibold mb-3">
            Alerta temprana de credenciales comprometidas en instituciones públicas LATAM
          </p>
          <p className="text-slate-400 leading-relaxed max-w-2xl">
            NOMAD Centinela es una plataforma open-source de ciberseguridad defensiva (Def/Acc) que monitorea fuentes OSINT públicas, detecta exposición de credenciales y notifica a los actores relevantes — sin jamás atacar, escanear ni almacenar información personal identificable. El track Def/Acc de hack@latam prioriza tecnologías que fortalecen las defensas de la sociedad contra amenazas a gran escala como ciberataques y fallas en sistemas críticos.
          </p>
          <div className="flex gap-4 mt-6 flex-wrap">
            <a
              href="https://github.com/shigerudev/HackIndies"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.make.com"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Make.com ↗
            </a>
            <a href={`${API_URL}/api/health`}
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              API health ↗
            </a>
            <a
              href="/casos/digecam"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Caso DIGECAM →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* SECTION 1: QUICK START */}
        <Section
          title="Quick start"
          description={`Apunta el front a NEXT_PUBLIC_API_URL (${API_URL}).`}
          badge="setup"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Variables de entorno</h3>
              <CodeBlock snippets={[
                {
                  lang: 'bash',
                  label: '.env',
                  code: `NEXT_PUBLIC_API_URL=http://localhost:3001
# Opcional, debe coincidir con MAKE_WEBHOOK_SECRET del backend si pruebas ingestión:
# NEXT_PUBLIC_MAKE_WEBHOOK_SECRET=tu-secreto`,
                },
                {
                  lang: 'dart',
                  label: 'Flutter',
                  code: `const apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:3001',
);`,
                },
              ]} />
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Smoke test</h3>
              <CodeBlock snippets={[
                {
                  lang: 'curl',
                  label: 'curl',
                  code: `curl -s "${API_URL}/api/health" | jq`,
                },
                {
                  lang: 'typescript',
                  label: 'Next.js',
                  code: `// app/page.tsx (Server Component)
const res = await fetch(
  process.env.NEXT_PUBLIC_API_URL + '/api/health',
  { cache: 'no-store' }
);
const health = await res.json();
// { status: 'ok', supabase: true, minimax: true, make_webhook: true }`,
                },
              ]} />
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">Endpoints disponibles</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 text-left">
                      <th className="pb-2 pr-4">Method</th>
                      <th className="pb-2 pr-4">Path</th>
                      <th className="pb-2">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {[
                      ['GET', '/api/health', 'Salud del sistema'],
                      ['GET', '/api/institutions', 'Lista de instituciones monitoreadas'],
                      ['GET', '/api/events', 'Eventos de exposición'],
                      ['GET', '/api/events/:id', 'Detalle de un evento'],
                      ['POST', '/api/citizen/check', 'Verificar si un hash está expuesto'],
                      ['GET', '/api/playbooks/search?q=', 'Buscar playbooks (FTS/vector cuando aplique)'],
                      ['GET', '/api/playbooks/:slug', 'Contenido de un playbook'],
                      ['POST', '/api/agent/triage', 'Ejecutar agente Triage'],
                      ['POST', '/api/agent/investigate', 'Ejecutar agente Investigator'],
                      ['POST', '/api/agent/pipeline', 'Triage + Investigator + HITL en una llamada'],
                      ['POST', '/api/agent/chat', 'Chat ciudadano (respuesta diferida JSON)'],
                      ['POST', '/api/webhooks/make/ingest', 'Ingesta desde Make.com'],
                    ].map(([m, p, d]) => (
                      <tr key={p} className="border-b border-slate-800">
                        <td className={`py-2 pr-4 font-bold ${m === 'GET' ? 'text-emerald-400' : 'text-amber-400'}`}>{m}</td>
                        <td className="py-2 pr-4 text-cyan-300">{p}</td>
                        <td className="py-2 text-slate-400">{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Section>

        {/* SECTION 2: API EXPLORER */}
        <Section
          title="API explorer"
          description={`Ejecuta cada endpoint contra ${API_URL}`}
          badge="interactive"
        >
          <div className="space-y-6">

            {/* 1. Health */}
            <EndpointCard
              method="GET"
              path="/api/health"
              description="Verifica que Supabase, MiniMax y el webhook de Make están operativos."
              action={async () => {
                const h = await fetchHealth();
                return h;
              }}
              snippets={snips('/api/health')}
            />

            {/* 2. Institutions */}
            <EndpointCard
              method="GET"
              path="/api/institutions"
              description="Instituciones del catálogo con sector, país y dominio ofuscado."
              action={async () => {
                const r = await fetchInstitutions();
                return r;
              }}
              snippets={snips('/api/institutions')}
            />

            {/* 3. Events list */}
            <EndpointCard
              method="GET"
              path="/api/events"
              description="Lista eventos de exposición. Filtra por status o severity."
              params={[
                { name: 'status', label: 'status', type: 'select', options: ['', 'pending_review', 'approved', 'rejected', 'published'], default: '' },
                { name: 'severity', label: 'severity', type: 'select', options: ['', 'low', 'medium', 'high', 'critical'], default: '' },
              ]}
              action={async (p) => {
                const qs = new URLSearchParams();
                if (p.status) qs.set('status', p.status);
                if (p.severity) qs.set('severity', p.severity);
                const res = await fetch(`${API_URL}/api/events?${qs.toString()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error(`API ${res.status}`);
                return res.json();
              }}
              snippets={snips('/api/events?status=pending_review')}
            />

            {/* 4. Event detail */}
            <EndpointCard
              method="GET"
              path="/api/events/:id"
              description="Detalle completo de un evento: traces de agentes, reviews HITL, payload."
              params={[
                {
                  name: 'event_id',
                  label: 'event_id',
                  type: 'select',
                  options: eventsCache.length
                    ? eventsCache.map((e) => e.id)
                    : ['cargando…'],
                  default: eventsCache[0]?.id ?? '',
                },
              ]}
              action={async (p) => {
                if (!eventsCache.length) {
                  await loadEventsForSelect();
                }
                const res = await fetch(`${API_URL}/api/events/${p.event_id}`, { cache: 'no-store' });
                if (!res.ok) throw new Error(`API ${res.status}`);
                return res.json();
              }}
              snippets={snips('/api/events/{id}')}
            />

            {/* 5. Citizen check */}
            <EndpointCard
              method="POST"
              path="/api/citizen/check"
              description="Verifica si un prefijo de hash aparece en la base de datos de breach. Solo k-anonymity: nunca se expone el hash completo."
              params={[
                {
                  name: 'hash_prefix',
                  label: 'hash_prefix',
                  type: 'text',
                  default: '',
                },
              ]}
              action={async (p) => {
                const prefix = (p.hash_prefix || '').trim().toLowerCase();
                if (prefix.length !== 5) {
                  throw new Error('El prefijo debe tener exactamente 5 caracteres hex (como exige el backend).');
                }
                const r = await checkCitizen(prefix);
                return r;
              }}
              snippets={[
                ...snips('/api/citizen/check', '{"hash_prefix":"a1b2c"}'),
                {
                  lang: 'dart',
                  label: 'Flutter',
                  code: `// Verificar si el ciudadano está expuesto\nfinal resp = await http.post(\n  Uri.parse('$API_URL/api/citizen/check'),\n  headers: {'Content-Type': 'application/json'},\n  body: jsonEncode({'hash_prefix': 'a1b2c'}),\n);\nfinal json = await resp.json();\n// { exposed: true, matched_institutions: ['RENAP'], ... }`,
                },
              ]}
            />

            {/* 6. Playbooks search */}
            <EndpointCard
              method="GET"
              path="/api/playbooks/search"
              description="Búsqueda en lenguaje natural sobre playbooks de respuesta. Usa pgvector FTS."
              params={[
                { name: 'q', label: 'q (query)', type: 'text', default: 'credenciales expuestas' },
              ]}
              action={async (p) => {
                const r = await searchPlaybooks(p.q || 'credenciales expuestas');
                return r;
              }}
              snippets={snips('/api/playbooks/search?q=credenciales')}
            />

            {/* 7. Playbook detail */}
            <EndpointCard
              method="GET"
              path="/api/playbooks/:slug"
              description="Contenido completo de un playbook en Markdown."
              params={[
                {
                  name: 'slug',
                  label: 'slug',
                  type: 'select',
                  options: [
                    'rotate-credentials',
                    'stealer-response',
                    'enable-2fa',
                    'csp-headers',
                    'api-rate-limit',
                    'incident-comms',
                  ],
                  default: 'rotate-credentials',
                },
              ]}
              action={async (p) => {
                const r = await fetchPlaybook(p.slug);
                return r;
              }}
              snippets={snips('/api/playbooks/rotate-credentials')}
            />

            {/* 8. Triage */}
            <EndpointCard
              method="POST"
              path="/api/agent/triage"
              description="Clasifica la severidad de un evento usando MiniMax. Si MiniMax falla, devuelve resultado mock (indicado con mock:true)."
              params={[
                {
                  name: 'event_id',
                  label: 'event_id',
                  type: 'select',
                  options: eventsCache.length ? eventsCache.map((e) => e.id) : ['cargando…'],
                  default: eventsCache[0]?.id ?? '',
                },
              ]}
              action={async (p) => {
                if (!eventsCache.length) await loadEventsForSelect();
                return runTriage(p.event_id);
              }}
              snippets={[
                ...snips('/api/agent/triage', '{"event_id":"..."}'),
              ]}
            />

            {/* 9. Investigate */}
            <EndpointCard
              method="POST"
              path="/api/agent/investigate"
              description="Busca fuentes OSINT para verificar el evento. Requiere HITL antes de confirmar. Usa MiniMax."
              params={[
                {
                  name: 'event_id',
                  label: 'event_id',
                  type: 'select',
                  options: eventsCache.length ? eventsCache.map((e) => e.id) : ['cargando…'],
                  default: eventsCache[0]?.id ?? '',
                },
              ]}
              action={async (p) => {
                if (!eventsCache.length) await loadEventsForSelect();
                return runInvestigate(p.event_id);
              }}
              snippets={snips('/api/agent/investigate', '{"event_id":"..."}')}
            />

            {/* 10. Pipeline */}
            <EndpointCard
              method="POST"
              path="/api/agent/pipeline"
              description="Ejecuta Triage + Investigator + estado HITL en una sola llamada atómica."
              params={[
                {
                  name: 'event_id',
                  label: 'event_id',
                  type: 'select',
                  options: eventsCache.length ? eventsCache.map((e) => e.id) : ['cargando…'],
                  default: eventsCache[0]?.id ?? '',
                },
              ]}
              action={async (p) => {
                if (!eventsCache.length) await loadEventsForSelect();
                return runPipeline(p.event_id);
              }}
              snippets={snips('/api/agent/pipeline', '{"event_id":"..."}')}
            />

            {/* 10b. Citizen chat */}
            <EndpointCard
              method="POST"
              path="/api/agent/chat"
              description="Asistente ciudadano. Fuera del stream SSE el backend suele responder JSON con `{ role, content, mock }`."
              params={[
                {
                  name: 'message',
                  label: 'message',
                  type: 'text',
                  default: '¿Qué recomiendas después de una filtración de credenciales?',
                },
              ]}
              action={async (p) =>
                citizenAgentChat([{ role: 'user', content: p.message || 'Hola.' }])
              }
              snippets={[
                ...snips('/api/agent/chat', '{"messages":[{"role":"user","content":"…"}]}'),
              ]}
            />

            {/* 11. Make ingest */}
            <EndpointCard
              method="POST"
              path="/api/webhooks/make/ingest"
              description={
                WEBHOOK_SECRET
                  ? 'Ingestión con `X-Nomad-Webhook-Secret` tomado desde `NEXT_PUBLIC_MAKE_WEBHOOK_SECRET`.'
                  : 'Configura NEXT_PUBLIC_MAKE_WEBHOOK_SECRET (igual que MAKE_WEBHOOK_SECRET en backend) antes de ejecutar.'
              }
              params={[
                { name: 'institution_slug', label: 'institution_slug', type: 'text', default: 'digecam' },
                { name: 'title', label: 'title', type: 'text', default: '[Sintético] Test desde playground' },
                { name: 'severity', label: 'severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
                { name: 'external_id', label: 'external_id', type: 'text', default: 'playground-ingest-001' },
              ]}
              action={async (p) =>
                makeIngest(
                  {
                    institution_slug: p.institution_slug,
                    title: p.title,
                    severity: p.severity,
                    external_id: p.external_id,
                  },
                  WEBHOOK_SECRET
                )
              }
              snippets={[
                {
                  lang: 'curl',
                  label: 'curl',
                  code: `# export WEBHOOK=$NEXT_PUBLIC_MAKE_WEBHOOK_SECRET
curl -X POST ${API_URL}/api/webhooks/make/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Nomad-Webhook-Secret: $WEBHOOK" \\
  -d '{"institution_slug":"digecam","title":"Test","severity":"medium","external_id":"test-001"}'`,
                },
                {
                  lang: 'typescript',
                  label: 'Next.js',
                  code: `await fetch(\`${API_URL}/api/webhooks/make/ingest\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Nomad-Webhook-Secret': process.env.NEXT_PUBLIC_MAKE_WEBHOOK_SECRET ?? '',
  },
  body: JSON.stringify({
    institution_slug: 'digecam',
    title: 'Test',
    severity: 'medium',
    external_id: 'test-001',
  }),
});`,
                },
              ]}
            />

          </div>
        </Section>

        {/* SECTION 3: INTEGRATION RECIPES */}
        <Section
          title="Integration recipes"
          description="Patrones reales para conectar frontend y mobile al backend."
          badge="cookbook"
        >
          <div className="space-y-4">

            {/* Recipe A: Next.js Server Component */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
                Recipe A — Next.js Server Component
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Datos en el servidor (RSC). Ideal para pages que no necesitan interactividad en tiempo real.
              </p>
              <CodeBlock snippets={[{
                lang: 'typescript',
                label: 'app/dashboard/page.tsx',
                code: `// app/dashboard/page.tsx (Next.js 15 Server Component)
import { fetchEvents } from '@/lib/api';

export default async function DashboardPage() {
  const { data: events } = await fetchEvents({ status: 'pending_review' });

  return (
    <ul>
      {events.map((e) => (
        <li key={e.id}>
          <span className={severityColor(e.severity)}>{e.severity}</span>
          {' '}{e.title}
        </li>
      ))}
    </ul>
  );
}`,
              }]} />
            </div>

            {/* Recipe B: Next.js Client Component */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
                Recipe B — Next.js Client Component con useState
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Interactividad. Ejecuta agentes, polling, streaming de chat.
              </p>
              <CodeBlock snippets={[{
                lang: 'typescript',
                label: 'components/AgentPanel.tsx',
                code: `'use client';
import { useState } from 'react';
import { runTriage, runInvestigate } from '@/lib/api';

export function AgentPanel({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  async function handleTriage() {
    setLoading(true);
    try {
      const json = await runTriage(eventId);
      setResult(json.triage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleTriage} disabled={loading}>
        {loading ? 'Ejecutando…' : 'Ejecutar Triage'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}`,
              }]} />
            </div>

            {/* Recipe C: Flutter */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
                Recipe C — Flutter con http
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Equivalente móvil del fetch. Compatible con emulator (<code>http://10.0.2.2:3001</code> para Android).
              </p>
              <CodeBlock snippets={[{
                lang: 'dart',
                label: 'lib/services/nomad_api.dart',
                code: `import 'dart:convert';
import 'package:http/http.dart' as http;

class NomadApi {
  static const apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://10.0.2.2:3001',
  );

  static Future<List<dynamic>> getEvents({String? status}) async {
    final qs = status != null ? '?status=$status' : '';
    final resp = await http.get(
      Uri.parse('$apiBase/api/events$qs'),
      headers: {'Content-Type': 'application/json'},
    );
    final json = jsonDecode(resp.body);
    return json['data'] as List<dynamic>;
  }

  static Future<Map<String, dynamic>> checkCitizen(String hashPrefix) async {
    final resp = await http.post(
      Uri.parse('$apiBase/api/citizen/check'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'hash_prefix': hashPrefix}),
    );
    return jsonDecode(resp.body) as Map<String, dynamic>;
  }
}`,
              }]} />
            </div>

            {/* Recipe D: SSE note */}
            <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-5">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">
                Recipe D — SSE streaming (limitación en Vercel)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                <code>POST /api/agent/chat</code> soporta streaming SSE en desarrollo local. En Vercel (serverless), el stream se convierte a JSON por incompatibilidad del runtime. La UI del chat ya tiene fallback JSON que funciona indistintamente. Si necesitas streaming real, desplega el backend en un hosting con soporte Node.js persistente (Railway, Render, Fly.io).
              </p>
              <CodeBlock snippets={[{
                lang: 'typescript',
                label: 'chat JSON (producción/serverless)',
                code: `const res = await fetch(\`${API_URL}/api/agent/chat\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: '¿Estoy expuesto?' }],
  }),
});
const json = await res.json();
// típico: { role: 'assistant', content: '...', mock?: boolean }`,
              }]} />
            </div>

          </div>
        </Section>

        {/* SECTION 4: MAKE.COM SCENARIOS */}
        <Section
          title="Make.com"
          description={`Conecta escenarios personalizados para que disparen contra ${API_URL}/api/webhooks/make/ingest (con el secreto compartido). No compartas URLs de webhook en público.`}
          badge="make"
          badgeColor="bg-purple-900 text-purple-300"
        >
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              Este repositorio no embebe webhooks reales. Crea en Make un módulo HTTP que haga{' '}
              <code className="text-cyan-300">POST</code> al endpoint de ingestión del backend y pasa el header{' '}
              <code className="text-cyan-300">X-Nomad-Webhook-Secret</code> con el mismo valor que{' '}
              <code className="text-cyan-300">MAKE_WEBHOOK_SECRET</code>.
            </p>
            <p className="text-slate-400">
              Opcionalmente expone <code>NEXT_PUBLIC_MAKE_WEBHOOK_SECRET</code> sólo en builds controlados para poder
              ejecutar la tarjeta desde el playground (en producción pública evita publicar el secreto).
            </p>
          </div>
        </Section>

        {/* SECTION 5: RULES & GUARDRAILS */}
        <Section
          title="Reglas de oro — lado del defensor"
          description="Esto NO es un toolkit de ataque. Es una plataforma de defensa. Estas reglas son estrictas."
          badge="ethics"
          badgeColor="bg-red-900 text-red-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: '1',
                title: 'No tocar lo ajeno',
                body: 'Cero pentest, cero escaneo activo sin autorización escrita. El proyecto solo lee fuentes OSINT públicas ya indexadas.',
              },
              {
                num: '2',
                title: 'No rehospedar PII',
                body: 'Solo confirmar exposición mediante k-anonymity. Nunca credenciales en claro. Datos sintéticos en seed.',
              },
              {
                num: '3',
                title: 'Lado del defensor',
                body: 'Si una feature puede usarse para atacar, se descarta o restringe. El track Def/Acc lo exige.',
              },
            ].map((r) => (
              <div key={r.num} className="rounded-xl border border-slate-700 bg-slate-900/50 p-5">
                <div className="w-7 h-7 rounded-full bg-red-900 text-red-300 flex items-center justify-center text-sm font-bold mb-3">
                  {r.num}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{r.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl border border-slate-700 bg-slate-950 text-sm text-slate-400">
            <strong className="text-white">Datos del seed:</strong> Todos los eventos en esta plataforma son sintéticos. Los dominios están ofuscados (ej. <code>renap[.]gob[.]gt</code>). No hay datos reales de brechas. El proyecto cumple con las reglas de seguridad del workspace.
          </div>
        </Section>

        {/* SECTION 5.5: FTS vs Vector comparison */}
        <Section
          title="FTS vs Vector — RAG semantico"
          description="Dos modos de busqueda en playbooks: Full-Text Search (FTS) y busqueda vectorial (pgvector). Cambia el modo y observa la diferencia en los rankings."
          badge="rag"
        >
          <FtsVsVector />
        </Section>

        {/* SECTION 6: COMPARISON MATRIX */}
        <Section
          title="Cómo nos diferenciamos"
          description="NOMAD Centinela es la única plataforma que combina las cuatro capacidades que los defensores LATAM necesitan."
          badge="comparativa"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Plataforma</th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium">Open Source</th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium">LATAM-first</th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium">Multi-stakeholder</th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium">HITL ético</th>
                  <th className="text-center py-3 px-3 text-slate-400 font-medium">Playbooks accionables</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { name: 'HIBP', open: false, latam: false, multi: false, hitl: false, playbooks: false },
                  { name: 'Spycloud / Constella', open: false, latam: false, multi: false, hitl: false, playbooks: false },
                  { name: 'Vector Crítico', open: true, latam: true, multi: false, hitl: false, playbooks: false },
                  { name: 'CIRTs nacionales', open: false, latam: true, multi: false, hitl: false, playbooks: false },
                  { name: 'NOMAD Centinela', open: true, latam: true, multi: true, hitl: true, playbooks: true },
                ].map((row) => (
                  <tr key={row.name} className={row.name === 'NOMAD Centinela' ? 'bg-cyan-950/30' : ''}>
                    <td className={`py-3 px-4 font-medium ${row.name === 'NOMAD Centinela' ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {row.name}
                    </td>
                    {(['open', 'latam', 'multi', 'hitl', 'playbooks'] as const).map((col) => (
                      <td key={col} className="text-center py-3 px-3">
                        {row[col] ? (
                          <span className={row.name === 'NOMAD Centinela' ? 'text-cyan-400' : 'text-emerald-400'}>✓</span>
                        ) : (
                          <span className="text-slate-600">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4 flex-wrap">
            <span className="text-xs text-slate-500">HIBP = Have I Been Pwned (Troy Hunt) · Spycloud / Constella = comerciales USA · CIRTs = Centros de Respuesta a Incidentes gubernamentales</span>
          </div>
        </Section>

        {/* FOOTER */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          NOMAD Centinela · Track Def/Acc · hack@latam · {new Date().getFullYear()}
          <br />
          <span className="font-mono text-xs mt-1 block">API: {API_URL}</span>
        </footer>
      </main>
    </div>
  );
}