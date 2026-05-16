const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Institution {
  id: string;
  slug: string;
  name: string;
  sector: string;
  domain_obfuscated: string;
}

async function getInstitutions(): Promise<{ data: Institution[]; mock: boolean }> {
  const res = await fetch(`${API_URL}/api/institutions`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export default async function HomePage() {
  let institutions: Institution[] = [];
  let mock = false;
  let error: string | null = null;

  try {
    const json = await getInstitutions();
    institutions = json.data;
    mock = json.mock;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-10 border-b border-slate-700 pb-6">
        <p className="text-sm uppercase tracking-widest text-cyan-400">NOMAD security</p>
        <h1 className="mt-2 text-3xl font-bold">NOMAD Centinela</h1>
        <p className="mt-2 text-slate-400">
          Dashboard Def/Acc — instituciones monitoreadas (Fase 0)
        </p>
        {mock && (
          <span className="mt-3 inline-block rounded bg-amber-900/40 px-2 py-1 text-xs text-amber-200">
            API en modo mock
          </span>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded border border-red-800 bg-red-950/50 p-4 text-red-200">
          No se pudo conectar al backend ({API_URL}). ¿Está corriendo{' '}
          <code className="text-cyan-300">npm run dev</code> en <code>backend/</code>?
          <br />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Instituciones ({institutions.length})
        </h2>
        <ul className="grid gap-3">
          {institutions.map((inst) => (
            <li
              key={inst.id}
              className="rounded-lg border border-slate-700 bg-slate-900/60 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{inst.name}</span>
                <span className="text-xs uppercase text-slate-500">{inst.sector}</span>
              </div>
              <p className="mt-1 font-mono text-sm text-cyan-400/80">{inst.domain_obfuscated}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
