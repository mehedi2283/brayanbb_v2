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
  'No Answer': '#94A3B8',      // slate-400
  'Failed': '#F43F5E',         // rose-500
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[220px]">
      <div className="col-span-1 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest absolute top-6 left-6">{t("chart.callOutcomes")}</h3>
        <div className="flex items-center space-x-6 mt-4">
          <div className="relative w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  stroke="none"
                  dataKey="value"
                  paddingAngle={2}
                  cornerRadius={4}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
            </div>
          </div>
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center text-sm space-x-2.5 font-medium text-slate-700">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}: <span className="font-bold text-slate-900 ml-1">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6 h-full">
        {data.map((item) => (
          <div key={item.name} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</span>
              <span className="text-sm font-bold bg-slate-50 px-2 py-1 rounded-lg" style={{ color: item.color }}>
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
