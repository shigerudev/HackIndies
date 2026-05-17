import { Toolbar } from '@/components/ui/Toolbar';
import LivePipelineRunner from '@/components/dashboard/LivePipelineRunner';

export default function PipelinePage() {
  return (
    <>
      <Toolbar
        eyebrow="NOMAD security"
        title="Pipeline en vivo"
      />
      <div className="page-content">
        <LivePipelineRunner />
      </div>
    </>
  );
}