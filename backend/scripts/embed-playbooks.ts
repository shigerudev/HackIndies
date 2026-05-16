#!/usr/bin/env node
/**
 * embed-playbooks.ts
 * Generates embeddings for all playbooks using MiniMax text-embedding API
 * and stores them in Supabase. Run once to populate the vector column.
 *
 * Usage: npx tsx scripts/embed-playbooks.ts
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MINIMAX_API_KEY
 */
import { getSupabase } from '../src/lib/supabase.js';
import { hasMiniMax, env } from '../src/lib/env.js';

const MODEL = 'embo-01';
const DIM = 1536; // matches the vector(1536) column in playbooks table

async function embedText(text: string): Promise<number[]> {
  const response = await fetch(`${env.minimaxBaseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.minimaxApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax embedding API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json() as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

async function main() {
  if (!hasMiniMax()) {
    console.error('❌ MINIMAX_API_KEY not set — cannot generate embeddings.');
    console.error('   Set it in backend/.env and try again.');
    process.exit(1);
  }

  const sb = getSupabase();
  if (!sb) {
    console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set.');
    process.exit(1);
  }

  console.log('=== Embed playbooks with pgvector ===\n');

  // Fetch all playbooks
  const { data: playbooks, error } = await sb
    .from('playbooks')
    .select('id, slug, title_es, body_md');

  if (error) {
    console.error('❌ Failed to fetch playbooks:', error.message);
    process.exit(1);
  }

  if (!playbooks?.length) {
    console.warn('⚠️  No playbooks found in database.');
    process.exit(0);
  }

  console.log(`Found ${playbooks.length} playbooks. Generating embeddings...\n`);

  for (const pb of playbooks) {
    console.log(`[${playbooks.indexOf(pb) + 1}/${playbooks.length}] ${pb.slug}`);
    try {
      const textToEmbed = `${pb.title_es}\n\n${pb.body_md}`;
      const embedding = await embedText(textToEmbed);

      if (embedding.length !== DIM) {
        console.warn(`   ⚠️  Embedding dimension mismatch: got ${embedding.length}, expected ${DIM}. Skipping.`);
        continue;
      }

      const { error: updateError } = await sb
        .from('playbooks')
        .update({ embedding })
        .eq('id', pb.id);

      if (updateError) {
        console.error(`   ❌ Failed to update ${pb.slug}:`, updateError.message);
      } else {
        console.log(`   ✅ ${pb.slug} embedded (dim=${embedding.length})`);
      }
    } catch (e) {
      console.error(`   ❌ Error embedding ${pb.slug}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log('\n=== Done ===');
}

main().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});