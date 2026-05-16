import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '0.0.0.0',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? '',
  minimaxBaseUrl: process.env.MINIMAX_BASE_URL ?? 'https://api.minimax.io/v1',
  minimaxModel: process.env.MINIMAX_MODEL ?? 'MiniMax-M2',
};

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey);
}

export function hasMiniMax(): boolean {
  const key = env.minimaxApiKey;
  return Boolean(key && key !== 'PEGAR_TU_API_KEY' && key !== 'your-minimax-api-key');
}
