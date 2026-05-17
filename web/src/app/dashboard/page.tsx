import WelcomeHero from '@/components/dashboard/WelcomeHero'
import SmartInsights from '@/components/dashboard/SmartInsights'
import AnalyticsOverview from '@/components/charts/AnalyticsOverview'
import InstitutionsDirectory from '@/components/dashboard/InstitutionsDirectory'
import ApiPlayground from '@/components/playground/ApiPlayground'
import CitizenCheck from '@/components/dashboard/CitizenCheck'
import CitizenAssistantSection from '@/components/dashboard/CitizenAssistantSection'
import PlaybookExplorer from '@/components/dashboard/PlaybookExplorer'
import LiveActivityFeed from '@/components/activity/LiveActivityFeed'
import SystemHealth from '@/components/dashboard/SystemHealth'
import RecentLogs from '@/components/dashboard/RecentLogs'

/**
 * Flujo usuario final — cada bloque encapsula ya el consumo real del backend:
 *  - Vista general + métricas         → Hero, SmartInsights, Analytics
 *  - Organizaciones                  → InstitutionsDirectory (/api/institutions)
 *  - IA operativa sobre eventos      → ApiPlayground (triage, investigate, pipeline)
 *  - Herramienta ciudadana correo    → CitizenCheck (/api/citizen/check)
 *  - Orientación por chat           → CitizenAssistantSection (/api/agent/chat)
 *  - Biblioteca táctica               → PlaybookExplorer (/api/playbooks/search + slug)
 *  - Cronología                       → LiveActivityFeed, RecentLogs (/api/events, etc.)
 *  - Salud infra                      → SystemHealth (/api/health + detalle opcional HITL vía otros módulos)
 */
export default function DashboardPage() {
  return (
    <div className="divide-y divide-white/[0.04]">
      <WelcomeHero />
      <SmartInsights />
      <AnalyticsOverview />
      <InstitutionsDirectory />
      <ApiPlayground />
      <CitizenCheck />
      <CitizenAssistantSection />
      <PlaybookExplorer />
      <LiveActivityFeed />
      <SystemHealth />
      <RecentLogs />
    </div>
  )
}
