import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NOMAD Centinela',
  description: 'Alerta temprana de exposición de credenciales — Def/Acc LATAM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#0a0a0a' }}>{children}</body>
    </html>
  );
}
