interface MetricCardProps {
  title: string;
  value: number;
}

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
      <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{title}</div>
      <div className="flex items-baseline justify-between mt-auto">
        <div className="text-3xl font-black text-slate-900 tracking-tight">{value.toLocaleString()}</div>
      </div>
    </div>
  );
}
