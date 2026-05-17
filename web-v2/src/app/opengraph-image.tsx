import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt =
  'NOMAD Centinela — Alerta temprana de credenciales para instituciones públicas LATAM';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#03060a',
          backgroundImage:
            'radial-gradient(ellipse at top, rgba(34, 211, 238, 0.22), transparent 60%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 88px',
          color: '#e6f1ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            color: '#22d3ee',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: '#22d3ee',
              boxShadow: '0 0 12px #22d3ee',
            }}
          />
          Track Def/Acc · hack@latam 2026
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 76,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            fontWeight: 700,
            maxWidth: 980,
          }}
        >
          Alerta temprana de credenciales para instituciones públicas LATAM.
        </div>

        <div
          style={{
            marginTop: 28,
            color: '#94a3b8',
            fontSize: 26,
            lineHeight: 1.5,
            maxWidth: 920,
          }}
        >
          Detectamos la exposición meses antes del ataque. Open-source, en español, con HITL
          ético.
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            fontSize: 22,
            color: '#67e8f9',
          }}
        >
          <span style={{ fontWeight: 800, color: '#3b82f6' }}>NOMAD</span>
          <span style={{ color: '#2dd4bf', fontWeight: 700 }}>CENTINELA</span>
          <span style={{ color: '#475569', marginLeft: 'auto', fontSize: 18 }}>
            github.com/shigerudev/HackIndies
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
