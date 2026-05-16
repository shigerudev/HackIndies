import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/app.js';

let appPromise: ReturnType<typeof buildApp> | null = null;

async function getApp() {
  if (!appPromise) appPromise = buildApp();
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  await app.ready();

  const method = (req.method ?? 'GET').toUpperCase();
  const url = req.url ?? '/';
  const headers = Object.fromEntries(
    Object.entries(req.headers).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;

  let payload: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof req.body === 'string') payload = req.body;
    else if (req.body !== undefined) payload = JSON.stringify(req.body);
  }

  const response = await app.inject({
    method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
    url,
    headers,
    payload,
  });

  res.statusCode = response.statusCode;
  for (const [key, value] of Object.entries(response.headers)) {
    if (value !== undefined) res.setHeader(key, String(value));
  }
  res.end(response.body);
}
