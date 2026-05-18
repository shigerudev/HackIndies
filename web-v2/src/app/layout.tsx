import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { FloatingChatBubble } from '@/components/FloatingChatBubble';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

const SITE_URL = 'https://nomad-centinela.example';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  title:
    'NOMAD Centinela — Alerta temprana de credenciales para instituciones públicas LATAM',
  description:
    'Detectamos la exposición de credenciales meses antes del ataque. Open-source, en español, con human-in-the-loop ético en cada decisión publicable.',
  applicationName: 'NOMAD Centinela',
  authors: [{ name: 'NOMAD security' }],
  keywords: [
    'ciberseguridad',
    'LATAM',
    'credenciales',
    'k-anonymity',
    'HITL',
    'OSINT',
    'Def/Acc',
    'open source',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_LA',
    url: '/',
    siteName: 'NOMAD Centinela',
    title:
      'NOMAD Centinela — Alerta temprana de credenciales para instituciones públicas LATAM',
    description:
      'Detectamos la exposición de credenciales meses antes del ataque. Open-source, en español.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOMAD Centinela',
    description:
      'Alerta temprana de credenciales para instituciones públicas LATAM. Open-source, HITL ético.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" dir="ltr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <FloatingChatBubble />
      </body>
    </html>
  );
}
