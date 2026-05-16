import 'dotenv/config';
import { generateCitizenReply } from '../src/lib/citizen-chat.js';
import { hasMiniMax } from '../src/lib/env.js';

async function main() {
  console.log('--- NOMAD Centinela — MiniMax chat test ---\n');
  console.log('MiniMax configured:', hasMiniMax());
  console.log('Base URL:', process.env.MINIMAX_BASE_URL);
  console.log('Model:', process.env.MINIMAX_MODEL);

  const { content, mock } = await generateCitizenReply([
    { role: 'user', content: '¿Qué hago si mi correo apareció en una brecha del gobierno?' },
  ]);

  console.log('\nmock:', mock);
  console.log('response:\n', content.slice(0, 500));
  if (mock) {
    console.error('\nFAIL: still using mock — check MINIMAX_API_KEY in backend/.env');
    process.exit(1);
  }
  console.log('\nOK: MiniMax responded.');
}

main().catch((e) => {
  console.error('FAIL:', e instanceof Error ? e.message : e);
  process.exit(1);
});
