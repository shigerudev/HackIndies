import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { hasSupabase } from '../lib/env.js';
import { getSupabase } from '../lib/supabase.js';
import {
  MOCK_EVENTS,
  MOCK_HASH_PREFIXES,
  MOCK_INSTITUTIONS,
  MOCK_PLAYBOOKS,
  getMockEventDetail,
} from '../data/mock.js';
import type { ExposureEvent, Institution, Playbook } from '../types/api.js';
import { generateCitizenReply, mockCitizenReply, streamCitizenReply } from '../lib/citizen-chat.js';
import { pipeUIMessageStreamToResponse } from 'ai';
import { searchPlaybooks } from '../lib/playbook-rag.js';
import { normalizeChatMessages } from '../lib/chat-messages.js';
import { hasMiniMax, hasMakeWebhook, hasMakeApi } from '../lib/env.js';

function useMock(): boolean {
  return !hasSupabase();
}

export async function registerApiRoutes(app: FastifyInstance) {
  app.get('/api/health', async (req) => {
    let supabaseOk = hasSupabase();
    if (supabaseOk) {
      try {
        const sb = getSupabase()!;
        const { error } = await sb.from('institutions').select('id').limit(1);
        if (error) supabaseOk = false;
      } catch {
        supabaseOk = false;
      }
    }
    return {
      status: 'ok',
      supabase: supabaseOk,
      minimax: hasMiniMax(),
      make_webhook: hasMakeWebhook(),
      make_api: hasMakeApi(),
      mock: useMock(),
      version: '0.1.0',
    };
  });

  app.get<{ Querystring: { status?: string; severity?: string } }>('/api/institutions', async (req) => {
    if (useMock()) {
      return { data: MOCK_INSTITUTIONS, mock: true };
    }
    const sb = getSupabase()!;
    const { data, error } = await sb.from('institutions').select('*').order('name');
    if (error) {
      req.log.error({ err: error }, 'GET /api/institutions supabase error');
      throw error;
    }
    return { data: data as Institution[], mock: false };
  });

  app.get<{ Querystring: { status?: string; severity?: string } }>('/api/events', async (req) => {
    const { status, severity } = req.query;
    if (useMock()) {
      let list = [...MOCK_EVENTS];
      if (status) list = list.filter((e) => e.status === status);
      if (severity) list = list.filter((e) => e.severity === severity);
      return { data: list, mock: true };
    }
    const sb = getSupabase()!;
    // Direct tables instead of v_events_detail view (avoids RLS/policy issues on the view)
    let eq = sb.from('exposure_events').select('*, institutions(name, slug), actors(name)').order('first_seen_at', { ascending: false });
    if (status) eq = eq.eq('status', status);
    if (severity) eq = eq.eq('severity', severity);
    const { data: rawEvents, error } = await eq;
    if (error) {
      req.log.error({ err: error }, 'GET /api/events supabase error');
      throw Object.assign(new Error(error.message), { statusCode: 502 });
    }
    const mapped: ExposureEvent[] = (rawEvents ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      severity: row.severity,
      status: row.status,
      institution_slug: row.institutions?.slug ?? '',
      institution_name: row.institutions?.name ?? '',
      actor_name: row.actors?.name ?? null,
      credentials_count: row.credentials_count,
      first_seen_at: row.first_seen_at,
    }));
    return { data: mapped, mock: false };
  });

  app.get<{ Params: { id: string } }>('/api/events/:id', async (req, reply) => {
    const { id } = req.params;
    if (useMock()) {
      const detail = getMockEventDetail(id);
      const event = MOCK_EVENTS.find((e) => e.id === id);
      if (!event && !detail) return reply.status(404).send({ error: 'Not found' });
      return {
        data: detail ?? { ...event!, payload: {}, traces: [], hitl_reviews: [] },
        mock: true,
      };
    }
    const sb = getSupabase()!;
    const { data: event, error } = await sb
      .from('exposure_events')
      .select('*, institutions(name, slug), actors(name)')
      .eq('id', id)
      .single();
    if (error || !event) {
      if (error) req.log.error({ err: error }, 'GET /api/events/:id supabase error');
      return reply.status(404).send({ error: 'Not found' });
    }
    const { data: traces } = await sb.from('agent_traces').select('*').eq('event_id', id);
    const { data: reviews } = await sb.from('hitl_reviews').select('*').eq('event_id', id);
    return {
      data: {
        id: event.id,
        title: event.title,
        summary: event.summary,
        severity: event.severity,
        status: event.status,
        institution_slug: (event as any).institutions?.slug ?? '',
        institution_name: (event as any).institutions?.name ?? '',
        actor_name: (event as any).actors?.name ?? null,
        credentials_count: event.credentials_count,
        first_seen_at: event.first_seen_at,
        payload: event.payload ?? {},
        traces: traces ?? [],
        hitl_reviews: reviews ?? [],
      },
      mock: false,
    };
  });

  const citizenSchema = z.object({
    hash_prefix: z.string().length(5).toLowerCase(),
  });

  app.post('/api/citizen/check', async (req, reply) => {
    const parsed = citizenSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { hash_prefix } = parsed.data;

    if (useMock()) {
      const eventIds = MOCK_HASH_PREFIXES[hash_prefix] ?? [];
      const events = MOCK_EVENTS.filter((e) => eventIds.includes(e.id)).map((e) => ({
        id: e.id,
        title: e.title,
        institution_name: e.institution_name,
      }));
      return {
        exposed: events.length > 0,
        events,
        recommendations: events.length > 0
          ? [
              'Cambiá contraseñas de cuentas asociadas a ese correo.',
              'Activá autenticación de dos factores (2FA).',
              'Revisá movimientos bancarios y reportá actividad sospechosa.',
            ]
          : ['No encontramos tu prefijo en brechas publicadas de demo.'],
        mock: true,
      };
    }

    const sb = getSupabase()!;
    const { data: alerts } = await sb
      .from('citizen_alerts')
      .select('event_id')
      .eq('hash_prefix', hash_prefix);
    if (!alerts?.length) {
      return {
        exposed: false,
        events: [],
        recommendations: ['No encontramos exposición para ese prefijo en nuestro registro.'],
        mock: false,
      };
    }
    const ids = alerts.map((a) => a.event_id).filter(Boolean);
    const { data: events } = await sb.from('exposure_events').select('id, title, institutions(name)').in('id', ids);
    return {
      exposed: true,
      events: (events ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        institution_name: e.institutions?.name ?? '',
      })),
      recommendations: [
        'Cambiá contraseñas de cuentas asociadas a ese correo.',
        'Activá 2FA en servicios críticos.',
        'Considerá alertas de crédito si hubo datos financieros en la brecha.',
      ],
      mock: false,
    };
  });

  app.get<{ Params: { slug: string } }>('/api/playbooks/:slug', async (req, reply) => {
    const { slug } = req.params;
    if (useMock()) {
      const pb = MOCK_PLAYBOOKS[slug];
      if (!pb) return reply.status(404).send({ error: 'Not found' });
      return { data: pb, mock: true };
    }
    const sb = getSupabase()!;
    const { data, error } = await sb.from('playbooks').select('slug, title_es, body_md, effort_hours, cost_estimate_usd, tags').eq('slug', slug).single();
    if (error || !data) return reply.status(404).send({ error: 'Not found' });
    return {
      data: {
        ...data,
        cost_estimate_usd: data.cost_estimate_usd,
      } as Playbook,
      mock: false,
    };
  });

  const chatSchema = z.object({
    messages: z.array(z.record(z.unknown())),
  });

  app.post<{ Querystring: { stream?: string } }>('/api/agent/chat', async (req, reply) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const messages = await normalizeChatMessages(parsed.data.messages);
    if (!messages.length) {
      return reply.status(400).send({ error: 'messages required' });
    }

    // Vercel serverless (con app.inject del handler) no soporta streaming real:
    // reply.raw es un mock buffereado. Forzamos JSON cuando VERCEL=1.
    // El front (CitizenChat) ya cae a JSON si no recibe chunks.
    const isVercel = process.env.VERCEL === '1';
    const wantsStream =
      !isVercel &&
      (req.query.stream === 'true' || req.headers.accept?.includes('text/event-stream'));

    if (wantsStream && hasMiniMax()) {
      try {
        const result = streamCitizenReply(messages);
        reply.hijack();
        pipeUIMessageStreamToResponse({
          response: reply.raw,
          stream: result.toUIMessageStream(),
          headers: {
            'X-Nomad-Mock': 'false',
            'X-Nomad-Provider': 'minimax',
          },
        });
        return;
      } catch (err) {
        req.log.error(err, 'MiniMax stream failed');
        return reply.status(502).send({
          error: 'MiniMax stream failed',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    try {
      const { content, mock } = await generateCitizenReply(messages);
      return {
        role: 'assistant' as const,
        content,
        mock,
        provider: mock ? undefined : 'minimax',
        model: mock ? undefined : process.env.MINIMAX_MODEL,
      };
    } catch (err) {
      req.log.error(err, 'MiniMax chat failed');
      if (hasMiniMax()) {
        return reply.status(502).send({
          error: 'MiniMax request failed',
          message: err instanceof Error ? err.message : 'Unknown error',
          hint: 'Verifica MINIMAX_API_KEY y MINIMAX_BASE_URL en backend/.env',
        });
      }
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      return {
        role: 'assistant' as const,
        content: mockCitizenReply(lastUser?.content ?? ''),
        mock: true,
      };
    }
  });

  app.get<{ Querystring: { q: string; limit?: string; mode?: string } }>('/api/playbooks/search', async (req, reply) => {
    const q = req.query.q?.trim();
    if (!q) {
      return reply.status(400).send({ error: 'Query parameter q is required' });
    }
    const limit = Math.min(Number(req.query.limit ?? 5) || 5, 20);
    const mode = (req.query.mode ?? 'auto') as 'fts' | 'vector' | 'auto';
    const data = await searchPlaybooks(q, limit, mode);
    return { data, mock: useMock(), query: q, mode };
  });
}
