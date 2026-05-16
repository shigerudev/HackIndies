import 'dotenv/config';

const PLACEHOLDER_SECRETS = new Set([
  'PEGAR_TU_API_KEY',
  'your-minimax-api-key',
  'your-make-webhook-secret',
  'your-make-api-token',
]);

export const env = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '0.0.0.0',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? '',
  minimaxBaseUrl: process.env.MINIMAX_BASE_URL ?? 'https://api.minimax.io/v1',
  minimaxModel: process.env.MINIMAX_MODEL ?? 'MiniMax-M2',
  makeWebhookSecret: process.env.MAKE_WEBHOOK_SECRET ?? '',
  makeApiToken: process.env.MAKE_API_TOKEN ?? '',
};

function isRealSecret(value: string): boolean {
  return Boolean(value && !PLACEHOLDER_SECRETS.has(value));
}

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey);
}

export function hasMiniMax(): boolean {
  return isRealSecret(env.minimaxApiKey);
}

export function hasMakeWebhook(): boolean {
  return isRealSecret(env.makeWebhookSecret);
}

export function hasMakeApi(): boolean {
  return isRealSecret(env.makeApiToken);
}
