#!/usr/bin/env node
/**
 * eval-triage.ts
 * Evaluates triage agent accuracy against golden-events.json
 *
 * Usage: npx tsx scripts/eval-triage.ts
 *        npx tsx scripts/eval-triage.ts --prod (uses production API)
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GOLDEN_PATH = resolve(import.meta.dirname, '../evals/golden-events.json');
const API = process.argv.includes('--prod')
  ? 'https://nomad-centinela-api.vercel.app'
  : 'http://localhost:3001';

interface GoldenEvent {
  id: string;
  description: string;
  signal: {
    title: string;
    summary?: string;
    institution_slug?: string;
    source_type: string;
  };
  expected: {
    severity: string;
    institution_slug?: string;
    hitl_required?: boolean;
    credentials_count_estimate_min?: number;
    malware_family?: string;
  };
}

interface TriageResult {
  severity: string;
  institution_slug: string;
  credentials_count_estimate?: number;
  malware_family?: string | null;
}

interface EvalResult {
  event_id: string;
  description: string;
  correct_severity: boolean;
  correct_institution: boolean;
  severity_score: number;
  institution_score: number;
  hitl_estimate: boolean;
  passed: boolean;
  triage?: TriageResult;
  error?: string;
}

function severityScore(expected: string, actual: string): number {
  const order = ['low', 'medium', 'high', 'critical'];
  const e = order.indexOf(expected);
  const a = order.indexOf(actual);
  const dist = Math.abs(e - a);
  return Math.max(0, 1 - dist / 3);
}

async function run() {
  console.log('=== NOMAD Centinela — Triage Evaluation ===\n');
  console.log(`Golden dataset: ${GOLDEN_PATH}`);
  console.log(`API: ${API}`);
  console.log('');

  let golden: GoldenEvent[];
  try {
    const raw = readFileSync(GOLDEN_PATH, 'utf-8');
    golden = JSON.parse(raw) as GoldenEvent[];
  } catch (e) {
    console.error('❌ Failed to load golden-events.json:', e);
    process.exit(1);
  }

  console.log(`Loaded ${golden.length} golden events.\n`);

  const results: EvalResult[] = [];

  for (const event of golden) {
    process.stdout.write(`[${event.id}] ${event.description.substring(0, 50)}... `);

    let triageResult: TriageResult | undefined;
    let errorMsg: string | undefined;

    try {
      const res = await fetch(`${API}/api/agent/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal: event.signal }),
      });

      if (!res.ok) {
        errorMsg = `HTTP ${res.status}`;
      } else {
        const data = await res.json() as { triage?: TriageResult };
        triageResult = data.triage;
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    }

    const result: EvalResult = {
      event_id: event.id,
      description: event.description,
      correct_severity: false,
      correct_institution: false,
      severity_score: 0,
      institution_score: 0,
      hitl_estimate: false,
      passed: false,
      triage: triageResult,
      error: errorMsg,
    };

    if (triageResult) {
      result.correct_severity = triageResult.severity === event.expected.severity;
      result.severity_score = severityScore(event.expected.severity, triageResult.severity);

      if (event.expected.institution_slug) {
        result.correct_institution = triageResult.institution_slug === event.expected.institution_slug;
        result.institution_score = result.correct_institution ? 1 : 0;
      } else {
        result.correct_institution = true; // not specified in golden
        result.institution_score = 1;
      }

      result.passed = result.severity_score >= 0.66 && result.institution_score >= 0.5;
    }

    results.push(result);

    if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      const status = result.passed ? '✅ PASS' : '⚠️  FAIL';
      const scores = `[sev=${result.severity_score.toFixed(2)}, inst=${result.institution_score.toFixed(2)}]`;
      console.log(`${status} ${scores} (got: ${triageResult?.severity ?? '?'}, exp: ${event.expected.severity})`);
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const avgSeverity = results.reduce((s, r) => s + r.severity_score, 0) / total;
  const avgInstitution = results.filter((r) => r.error == null).reduce((s, r) => s + r.institution_score, 0) / total;

  console.log('\n=== Results ===');
  console.log(`Passed: ${passed}/${total} (${((passed / total) * 100).toFixed(0)}%)`);
  console.log(`Avg severity score: ${avgSeverity.toFixed(3)}`);
  console.log(`Avg institution score: ${avgInstitution.toFixed(3)}`);

  console.log('\nPer-event breakdown:');
  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    const triage = r.triage ? `${r.triage.severity}/${r.triage.institution_slug}` : r.error ?? '?';
    console.log(`  ${icon} ${r.event_id}: ${triage} (exp: ${r.description.split(' - ')[0]})`);
  }

  if (avgSeverity >= 0.7 && passed >= 7) {
    console.log('\n🎯 Triage agent is performing well — ready for demo.');
  } else if (avgSeverity >= 0.5) {
    console.log('\n⚠️  Triage agent is acceptable but has room for improvement.');
  } else {
    console.log('\n❌ Triage agent needs significant improvement before demo.');
  }
}

run().catch((e) => {
  console.error('❌ Eval script error:', e);
  process.exit(1);
});