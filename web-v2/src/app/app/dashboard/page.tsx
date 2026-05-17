import WelcomeHero from '@/components/dashboard/WelcomeHero'
import LivePipelineRunner from '@/components/dashboard/LivePipelineRunner'
import SmartInsights from '@/components/dashboard/SmartInsights'
import AnalyticsOverview from '@/components/charts/AnalyticsOverview'
import HowItWorks from '@/components/dashboard/HowItWorks'

export default function DashboardPage() {
  return (
    <>
      <WelcomeHero />
      <LivePipelineRunner />
      <SmartInsights />
      <AnalyticsOverview />
      <HowItWorks />
    </>
  )
}