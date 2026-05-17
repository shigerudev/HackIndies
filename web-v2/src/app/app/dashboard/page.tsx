import { fetchEvents } from '@/lib/api';
import { Toolbar } from '@/components/ui/Toolbar';
import SmartInsights from '@/components/dashboard/SmartInsights';
import AnalyticsOverview from '@/components/charts/AnalyticsOverview';

export default async function DashboardPage() {
  let mock = false;

  try {
    const res = await fetchEvents();
    mock = res.mock;
  } catch {
    mock = false;
  }

  return (
    <>
      <Toolbar
        eyebrow="NOMAD security"
        title="Resumen"
        meta={mock ? 'Modo mock activo' : undefined}
        actions={
          mock ? (
            <span className="tag amber">API mock</span>
          ) : undefined
        }
      />
      <SmartInsights />
      <AnalyticsOverview />
    </>
  );
}