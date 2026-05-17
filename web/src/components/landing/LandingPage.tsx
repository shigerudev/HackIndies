'use client'

import './landing-base.css'
import './App.css'
import Navbar from './Navbar'
import HeroContent from './HeroContent'
import FooterElements from './FooterElements'
import ProblemSection from './ProblemSection'
import SolutionSection from './SolutionSection'
import AudienceSection from './AudienceSection'
import ComparisonSection from './ComparisonSection'
import CasesSection from './CasesSection'
import CtaSection from './CtaSection'
import PageFooter from './PageFooter'
import { useScrollReveal } from './useScrollReveal'

export default function LandingPage() {
  useScrollReveal()

  return (
    <>
      <a href="#platform" className="skip-link">
        Saltar al contenido
      </a>
      <main className="hero-section">
        <video
          className="hero-bg-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          tabIndex={-1}
        />
        <Navbar />
        <HeroContent />
        <FooterElements />
      </main>
      <ProblemSection />
      <SolutionSection />
      <AudienceSection />
      <ComparisonSection />
      <CasesSection />
      <CtaSection />
      <PageFooter />
    </>
  )
}
