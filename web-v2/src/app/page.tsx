import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { Architecture } from '@/components/landing/Architecture';
import { Audiences } from '@/components/landing/Audiences';
import { CaseDigecam } from '@/components/landing/CaseDigecam';
import { Comparison } from '@/components/landing/Comparison';
import { Ethics } from '@/components/landing/Ethics';
import { OpenSource } from '@/components/landing/OpenSource';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <Solution />
        <Architecture />
        <Audiences />
        <CaseDigecam />
        <Comparison />
        <Ethics />
        <OpenSource />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
