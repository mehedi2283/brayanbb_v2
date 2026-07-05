import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
}

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-24">
      <div className="text-xs font-semibold text-slate-500 uppercase">{title}</div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
