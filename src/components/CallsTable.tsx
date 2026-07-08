import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { CallLog } from '../types';
import { cn } from '../lib/utils';
import { Agent } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

interface CallsTableProps {
  calls: CallLog[];
  agents: Agent[];
  onOpenSummary: (call: CallLog) => void;
}

const statusColors: Record<string, string> = {
  'Human Answered': 'bg-emerald-100 text-emerald-700',
  'Voicemail': 'bg-amber-100 text-amber-700',
  'Failed': 'bg-rose-100 text-rose-700',
  'No Answer': 'bg-slate-100 text-slate-600',
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function CallsTable({ calls, agents, onOpenSummary }: CallsTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCalls = calls.filter(call => 
    call.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : t("app.unknownAgent");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[300px]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-4 shrink-0">
        <div className="flex">
          <button 
            className="px-4 py-3 text-sm font-bold border-b-2 border-blue-600 text-blue-600"
          >
            {t("metrics.attempted")}
          </button>
        </div>
        <div className="flex items-center space-x-2 py-2 tour-search-field">
          <input 
            type="text" 
            placeholder={t("callsTable.search")} 
            className="text-xs border border-slate-300 rounded px-3 py-1.5 w-48 outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase sticky top-0">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3">{t("callsTable.contact")}</th>
              <th className="px-4 py-3">{t("callsTable.agent")}</th>
              <th className="px-4 py-3 w-32">{t("callsTable.status")}</th>
              <th className="px-4 py-3">{t("callsTable.date")}</th>
              <th className="px-4 py-3 w-20">{t("callsTable.duration")}</th>
              <th className="px-4 py-3">{t("callsTable.actions")}</th>
              <th className="px-4 py-3 w-32 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-600 font-medium">
            {filteredCalls.map(call => (
              <tr key={call.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-bold text-slate-900">{call.contactName}</td>
                <td className="px-4 py-2.5 text-slate-700">{getAgentName(call.agentId)}</td>
                <td className="px-4 py-2.5">
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap", statusColors[call.status])}>
                    {call.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">{format(new Date(call.createdAt), 'MMM dd, hh:mm a')}</td>
                <td className="px-4 py-2.5 font-mono">{formatDuration(call.duration)}</td>
                <td className="px-4 py-2.5 truncate">{call.callDirection}</td>
                <td className="px-4 py-2.5 text-right space-x-1.5 flex items-center justify-end">
                  <button 
                    onClick={() => onOpenSummary(call)}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-colors tour-summary-button"
                  >
                    {t("callsTable.summary")}
                  </button>
                </td>
              </tr>
            ))}
            {filteredCalls.length === 0 && (
              <tr className="tour-summary-button">
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">{t("callsTable.noCalls")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="h-12 border-t border-slate-200 flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
        <span className="text-xs text-slate-500 font-medium">{t("callsTable.showing", { count: filteredCalls.length, total: filteredCalls.length })}</span>
        <div className="flex space-x-1">
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400">&laquo;</button>
          <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold">1</button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400">&raquo;</button>
        </div>
      </div>
    </div>
  );
}
