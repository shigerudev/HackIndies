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
} from '@/lib/playground-api';
import { fetchEvents, runTriage, runInvestigate, searchPlaybooks } from '@/lib/api';

const API_URL = 'https://nomad-centinela-api.vercel.app';

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

  return (
    <div className="page-content">
      {/* SECTION 1: QUICK START */}
      <Section
        title="Quick start"
        description="Conectar tu app al backend en 30 segundos."
        badge="setup"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 className="pg-section__h3">Variables de entorno</h3>
            <CodeBlock snippets={[
              {
                lang: 'bash',
                label: '.env',
                code: `NEXT_PUBLIC_API_URL=https://nomad-centinela-api.vercel.app`,
              },
              {
                lang: 'dart',
                label: 'Flutter',
                code: `// lib/main.dart o similar
const apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'https://nomad-centinela-api.vercel.app',
);`,
              },
            ]} />
          </div>

          <div className="card">
            <h3 className="pg-section__h3">Smoke test</h3>
            <CodeBlock snippets={[
              {
                lang: 'curl',
                label: 'curl',
                code: `curl -s https://nomad-centinela-api.vercel.app/api/health | jq`,
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

          <div className="card">
            <h3 className="pg-section__h3">Endpoints disponibles</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="pb-2 pr-4">Method</th>
                    <th className="pb-2 pr-4">Path</th>
                    <th className="pb-2">Descripcion</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[
                    ['GET', '/api/health', 'Salud del sistema'],
                    ['GET', '/api/institutions', 'Lista de instituciones monitoreadas'],
                    ['GET', '/api/events', 'Eventos de exposicion'],
                    ['GET', '/api/events/:id', 'Detalle de un evento'],
                    ['POST', '/api/citizen/check', 'Verificar si un hash esta expuesto'],
                    ['GET', '/api/playbooks', 'Lista de playbooks'],
                    ['GET', '/api/playbooks/search?q=', 'Buscar playbooks (FTS)'],
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
        description="Ejecuta cada endpoint en tiempo real contra produccion."
        badge="interactive"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <EndpointCard
            method="GET"
            path="/api/health"
            description="Verifica que Supabase, MiniMax y el webhook de Make estan operativos."
            action={async () => fetchHealth()}
            snippets={snips('/api/health')}
          />

          <EndpointCard
            method="GET"
            path="/api/institutions"
            description="Lista todas las instituciones que NOMAD monitorea con conteo de eventos."
            action={async () => fetchInstitutions()}
            snippets={snips('/api/institutions')}
          />

          <EndpointCard
            method="GET"
            path="/api/events"
            description="Lista eventos de exposicion. Filtra por status o severity."
            params={[
              { name: 'status', label: 'status', type: 'select', options: ['', 'pending_review', 'published', 'dismissed'], default: '' },
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

          <EndpointCard
            method="GET"
            path="/api/events/:id"
            description="Detalle completo de un evento: traces de agentes, reviews HITL, payload."
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
              const res = await fetch(`${API_URL}/api/events/${p.event_id}`, { cache: 'no-store' });
              if (!res.ok) throw new Error(`API ${res.status}`);
              return res.json();
            }}
            snippets={snips('/api/events/{id}')}
          />

          <EndpointCard
            method="POST"
            path="/api/citizen/check"
            description="Verifica si un prefijo de hash aparece en la base de datos de breach. Solo k-anonymity: nunca se expone el hash completo."
            params={[
              { name: 'hash_prefix', label: 'hash_prefix', type: 'text', default: 'a1b2c' },
            ]}
            action={async (p) => checkCitizen(p.hash_prefix)}
            snippets={[
              ...snips('/api/citizen/check', '{"hash_prefix":"a1b2c"}'),
              {
                lang: 'dart',
                label: 'Flutter',
                code: `// Verificar si el ciudadano esta expuesto\nfinal resp = await http.post(\n  Uri.parse('$API_URL/api/citizen/check'),\n  headers: {'Content-Type': 'application/json'},\n  body: jsonEncode({'hash_prefix': 'a1b2c'}),\n);\nfinal json = await resp.json();\n// { exposed: true, matched_institutions: ['RENAP'], ... }`,
              },
            ]}
          />

          <EndpointCard
            method="GET"
            path="/api/playbooks/search"
            description="Busqueda en lenguaje natural sobre playbooks de respuesta. Usa pgvector FTS."
            params={[
              { name: 'q', label: 'q (query)', type: 'text', default: 'credenciales expuestas' },
            ]}
            action={async (p) => searchPlaybooks(p.q || 'credenciales expuestas')}
            snippets={snips('/api/playbooks/search?q=credenciales')}
          />

          <EndpointCard
            method="GET"
            path="/api/playbooks/:slug"
            description="Contenido completo de un playbook en Markdown."
            params={[
              {
                name: 'slug',
                label: 'slug',
                type: 'select',
                options: ['credential-exposure-response', 'phishing-campaign-detection', 'insider-threat-response'],
                default: 'credential-exposure-response',
              },
            ]}
            action={async (p) => fetchPlaybook(p.slug)}
            snippets={snips('/api/playbooks/credential-exposure-response')}
          />

          <EndpointCard
            method="POST"
            path="/api/agent/triage"
            description="Clasifica la severidad de un evento usando MiniMax. Si MiniMax falla, devuelve resultado mock."
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
              {
                lang: 'typescript',
                label: 'con fallback mock',
                code: `const json = await runTriage(eventId);
if (json.mock) {
  console.log('Triage en modo mock — MiniMax no disponible');
}`,
              },
            ]}
          />

          <EndpointCard
            method="POST"
            path="/api/agent/investigate"
            description="Busca fuentes OSINT para verificar el evento. Usa MiniMax."
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

          <EndpointCard
            method="POST"
            path="/api/agent/pipeline"
            description="Ejecuta Triage + Investigator + estado HITL en una sola llamada atomica."
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

          <EndpointCard
            method="POST"
            path="/api/webhooks/make/ingest"
            description="Ingesta evento sintetico desde Make.com. El secret ya viene configurado."
            params={[
              { name: 'institution_slug', label: 'institution_slug', type: 'text', default: 'digecam' },
              { name: 'title', label: 'title', type: 'text', default: '[Sintetico] Test desde playground' },
              { name: 'severity', label: 'severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
              { name: 'external_id', label: 'external_id', type: 'text', default: 'playground-001' },
            ]}
            action={async (p) => makeIngest({
              institution_slug: p.institution_slug,
              title: p.title,
              severity: p.severity,
              external_id: p.external_id,
            })}
            snippets={[
              {
                lang: 'curl',
                label: 'curl',
                code: `curl -X POST ${API_URL}/api/webhooks/make/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Nomad-Webhook-Secret: nomad-make-dev-7f3a9c2e1b8d4f6a0e5c9b2d8f1a4e7" \\
  -d '{"institution_slug":"digecam","title":"Test","severity":"medium","external_id":"test-001"}'`,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 className="pg-section__h3">Recipe A — Next.js Server Component</h3>
            <p className="pg-section__p">Datos en el servidor (RSC). Ideal para pages sin interactividad en tiempo real.</p>
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

          <div className="card">
            <h3 className="pg-section__h3">Recipe B — Next.js Client Component</h3>
            <p className="pg-section__p">Interactividad. Ejecuta agentes, polling, streaming de chat.</p>
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

          <div className="card">
            <h3 className="pg-section__h3">Recipe C — Flutter con http</h3>
            <p className="pg-section__p">Equivalente movil del fetch. Compatible with emulator (<code>http://10.0.2.2:3001</code> for Android).</p>
            <CodeBlock snippets={[{
              lang: 'dart',
              label: 'lib/services/nomad_api.dart',
              code: `import 'dart:convert';
import 'package:http/http.dart' as http;

class NomadApi {
  static const apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'https://nomad-centinela-api.vercel.app',
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

          <div className="card pg-recipe-d">
            <h3 className="pg-section__h3 pg-section__h3--amber">Recipe D — SSE streaming (limitacion en Vercel)</h3>
            <p className="pg-recipe-d__p">
              <code>POST /api/agent/chat</code> soporta streaming SSE en desarrollo local. En Vercel (serverless), el stream se convierte a JSON por incompatibilidad del runtime. La UI del chat ya tiene fallback JSON que funciona indistintamente.
            </p>
            <CodeBlock snippets={[{
              lang: 'typescript',
              label: 'chat fallback (funciona en prod)',
              code: `const res = await fetch(\`\${API_URL}/api/agent/chat\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: '¿Estoy expuesto?' }] }),
});
const { messages } = await res.json(); // JSON normal, no stream
const reply = messages[messages.length - 1].content;`,
            }]} />
          </div>
        </div>
      </Section>

      {/* SECTION 4: MAKE.COM SCENARIOS */}
      <Section
        title="Make.com scenarios"
        description="Los webhooks activos en tu cuenta. Puedes dispararlos manualmente o conectar fuentes OSINT."
        badge="make"
        badgeColor="bg-purple-900 text-purple-300"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              name: 'NOMAD Centinela - Ingesta OSINT sintética',
              id: '5087018',
              hook: 'https://hook.us2.make.com/vz2nrhdwcfdh64iz7igbbj0iirem4wx5',
              desc: 'Trigger: webhook personalizado. Envía datos al backend via POST /api/webhooks/make/ingest.',
            },
            {
              name: 'NOMAD Centinela - HITL email',
              id: '5087019',
              hook: 'https://hook.us2.make.com/1f2bkj72aiqxb4abellrbn3ulkwcbttv',
              desc: 'Trigger: webhook personalizado. Envía email a z648s.7bt@gmail.com cuando el backend detecta pending_review.',
            },
          ].map((s) => (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                <span className="text-xs font-mono text-slate-500">id {s.id}</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{s.desc}</p>
              <code style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', color: 'var(--brand-cyan)', background: 'var(--bg-inset)', padding: '4px 8px', borderRadius: 6, display: 'block', wordBreak: 'break-all' }}>{s.hook}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 5: FTS vs Vector */}
      <Section
        title="FTS vs Vector — RAG semantico"
        description="Dos modos de busqueda en playbooks: Full-Text Search (FTS) y busqueda vectorial (pgvector). Cambia el modo y observa la diferencia en los rankings."
        badge="rag"
      >
        <FtsVsVector />
      </Section>

      {/* FOOTER */}
      <footer style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: 13, color: 'var(--fg-muted)' }}>
        NOMAD Centinela · Track Def/Acc · hack@latam · {new Date().getFullYear()}
        <br />
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, display: 'block', marginTop: 4 }}>API: {API_URL}</span>
      </footer>
    </div>
  );
}