import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface ChartRowProps {
  humanAnswered: number;
  voicemail: number;
  noAnswer: number;
  failed: number;
}

const COLORS = {
  'Human Answered': '#10B981', // emerald-500
  'Voicemail': '#FBBF24',      // amber-400
  'No Answer': '#F97316',      // orange-500
  'Failed': '#EF4444',         // rose-500
};

export function ChartRow({ humanAnswered, voicemail, noAnswer, failed }: ChartRowProps) {
  const { t } = useLanguage();
  const total = humanAnswered + voicemail + noAnswer + failed;
  const data = [
    { name: t('chart.humanAnswered'), value: humanAnswered, color: COLORS['Human Answered'] },
    { name: t('chart.voicemail'), value: voicemail, color: COLORS['Voicemail'] },
    { name: t('chart.noAnswer'), value: noAnswer, color: COLORS['No Answer'] },
    { name: t('chart.failed'), value: failed, color: COLORS['Failed'] },
  ];

  return (
    <div className="grid grid-cols-12 gap-5 h-[200px]">
      <div className="col-span-5 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-8">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                stroke="none"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold leading-none">{total}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Total</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold mb-2">{t("chart.callOutcomes")}</div>
          {data.map((item) => (
            <div key={item.name} className="flex items-center text-xs space-x-2 font-medium text-slate-600">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span>{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-7 grid grid-cols-2 gap-4 h-full">
        {data.map((item) => (
          <div key={item.name} className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
            <div className="text-xl font-bold">
              {item.value} <span className="text-xs font-normal ml-2" style={{ color: item.color }}>{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
