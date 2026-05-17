import './App.css'
import Navbar from './components/Navbar'
import HeroContent from './components/HeroContent'
import FooterElements from './components/FooterElements'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import AudienceSection from './components/AudienceSection'
import ComparisonSection from './components/ComparisonSection'
import CasesSection from './components/CasesSection'
import CtaSection from './components/CtaSection'
import PageFooter from './components/PageFooter'
import { useScrollReveal } from './hooks/useScrollReveal'

function App() {
  useScrollReveal()

  return (
    <>
      <main className="hero-section">
        <video
          className="hero-bg-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4"
          autoPlay
          loop
          muted
          playsInline
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

export default App
