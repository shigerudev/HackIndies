'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NAV_ITEMS: Array<[string, string]> = [
  ['Problema', '#problema'],
  ['Solución', '#solucion'],
  ['Audiencias', '#audiencias'],
  ['Caso DIGECAM', '#caso'],
  ['Stack', '#stack'],
  ['Open source', '#open-source'],
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-header__logo" aria-label="NOMAD Centinela — inicio">
            <Image
              src="/logo-horizontal.png"
              alt="NOMAD Centinela"
              width={220}
              height={36}
              priority
              style={{ height: 36, width: 'auto' }}
            />
          </Link>

          <nav className="site-header__nav" aria-label="Secciones">
            {NAV_ITEMS.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <div className="site-header__actions">
            <a className="btn-link desktop-only" href="#caso">
              Ver demo
            </a>
            <Button href="/app" className="desktop-only btn-sm">
              Entrar al producto
            </Button>
            <Button
              variant="ghost"
              href="https://github.com/shigerudev/HackIndies"
              target="_blank"
              aria-label="Star en GitHub"
            >
              <Github size={16} />
              <span className="desktop-only">Star en GitHub</span>
            </Button>
            <button
              type="button"
              className="btn btn-ghost mobile-menu-btn"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((s) => !s)}
              style={{ padding: '8px 10px' }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="Menú móvil"
            style={{
              display: 'grid',
              gap: 4,
              padding: '8px 0 18px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {NAV_ITEMS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: 'var(--fg-secondary)',
                  textDecoration: 'none',
                  padding: '10px 4px',
                  fontSize: 15,
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
