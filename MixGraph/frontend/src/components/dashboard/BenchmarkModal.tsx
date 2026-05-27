import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BenchmarkGeneralStats from './BenchmarkGeneralStats';
import BenchmarkGuidedComparison from './BenchmarkGuidedComparison';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BenchmarkModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent
        className="w-[800px] max-w-[calc(100vw-2rem)]"
        contentClassName="max-h-[90vh] overflow-y-auto bg-slate-950/95 text-white backdrop-blur-2xl"
        contentStyle={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.3) transparent' }}
      >
        <DialogHeader>
          <DialogTitle className="text-cyan-100">Benchmark de Algoritmos</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-8">
          <BenchmarkGeneralStats />
          <div className="border-t border-zinc-700/50 pt-6">
            <BenchmarkGuidedComparison />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
