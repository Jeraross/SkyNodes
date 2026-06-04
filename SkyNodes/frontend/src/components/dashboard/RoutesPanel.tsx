// src/components/dashboard/RoutesPanel.tsx
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { routes } from '../../data/routes';

const typeColors: Record<string, string> = {
  hub: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  regional: 'bg-green-500/20 text-green-300 border-green-500/40',
  inter_regional: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

export default function RoutesPanel() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">{routes.length} rotas na malha aérea</p>
      <ScrollArea className="h-[420px] rounded-md border border-slate-700/50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs">Origem</TableHead>
              <TableHead className="text-slate-400 text-xs">Destino</TableHead>
              <TableHead className="text-slate-400 text-xs">Peso</TableHead>
              <TableHead className="text-slate-400 text-xs">Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map(r => (
              <TableRow key={r.id} className="border-slate-700/30 hover:bg-slate-800/40">
                <TableCell className="font-mono text-cyan-300 text-xs">{r.from}</TableCell>
                <TableCell className="font-mono text-cyan-300 text-xs">{r.to}</TableCell>
                <TableCell className="text-slate-300 text-xs">{r.weight}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${typeColors[r.type] ?? ''}`}>
                    {r.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
