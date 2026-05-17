'use client';

import { useState } from 'react';
import { checkCitizen } from '@/lib/playground-api';
import { Toolbar } from '@/components/ui/Toolbar';
import { KeyValue } from '@/components/ui/KeyValue';
import { Tag } from '@/components/ui/Tag';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function CitizenPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hashPrefix, setHashPrefix] = useState<string | null>(null);
  const [result, setResult] = useState<{
    exposed: boolean;
    events: Array<{ id: string; title: string; institution_name: string }>;
    recommendations: string[];
    mock: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Calculate SHA-1 client-side
    let hashPrefix: string;
    try {
      const encoded = new TextEncoder().encode(email.trim().toLowerCase());
      const hashBuffer = await crypto.subtle.digest('SHA-1', encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      hashPrefix = hashHex.slice(0, 5);
    } catch {
      setError('No se pudo calcular el hash. Probá en un navegador con HTTPS.');
      setLoading(false);
      return;
    }

    try {
      const res = await checkCitizen(hashPrefix);
      setHashPrefix(hashPrefix);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toolbar
        eyebrow="Ciudadano"
        title="Verificar mi correo"
        meta="k-anonymity activo · nunca se envia el correo entero"
      />

      <div className="page-content">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(34,211,238,0.08)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={28} style={{ color: 'var(--brand-cyan)' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 8 }}>
              ¿Mi correo fue expuesto?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
              Ingresá tu correo institucional. <strong style={{ color: 'var(--fg-secondary)' }}>Nunca sale del dispositivo.</strong> Solo los primeros 5 caracteres de su hash SHA-1 viajan al servidor.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="tu.correo@institucion.gob.gt"
              style={{
                flex: 1,
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 14,
                color: 'var(--fg-primary)',
                fontFamily: 'var(--font-jetbrains)',
                outline: 'none',
                transition: 'border-color var(--t-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
              aria-label="Correo institucional"
            />
            <button
              type="button"
              onClick={handleCheck}
              disabled={loading || !email.trim()}
              className="btn btn-primary"
            >
              {loading ? <Spinner size={14} /> : null}
              {loading ? 'Verificando…' : 'Verificar'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.35)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-rose)' }}>Error</div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2 }}>{error}</div>
              </div>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 20, padding: '20px', borderRadius: 12, background: result.exposed ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${result.exposed ? 'rgba(244,63,94,0.35)' : 'rgba(16,185,129,0.35)'}` }}>
              {result.exposed ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(244,63,94,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={18} style={{ color: 'var(--accent-rose)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-rose)' }}>Posible exposicion detectada</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                        Hash enviado: <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--brand-cyan)' }}>{hashPrefix}***</span>
                      </div>
                    </div>
                  </div>

                  {result.events.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Coincidencias en</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {Array.from(new Set(result.events.map((e) => e.institution_name))).map((inst) => (
                          <Tag key={inst} variant="red">{inst}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Recomendaciones</div>
                      <ul style={{ paddingLeft: 16 }}>
                        {result.recommendations.map((r, i) => (
                          <li key={i} style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 4, lineHeight: 1.55 }}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-emerald)' }}>No encontramos coincidencias</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                      Hash enviado: <span style={{ fontFamily: 'var(--font-jetbrains)', color: 'var(--brand-cyan)' }}>{hashPrefix}***</span>
                    </div>
                  </div>
                </div>
              )}

              {result.mock && (
                <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 12, color: 'var(--sev-medium)' }}>
                  Modo demo activo — resultados simulados
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}