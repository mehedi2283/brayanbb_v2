import React, { useState } from 'react';
import { CallLog } from '../types';
import { Agent } from '../api';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, AlignLeft, FileText, Info, Play, Search, Clock, FileText as TranscriptIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface CallsTableProps {
  onOpenSummary: (call: CallLog) => void;
  calls: CallLog[];
  agents: Agent[];
  
}

const statusColors: Record<string, string> = {
  'Human Answered': 'bg-emerald-100 text-emerald-700',
  'Voicemail': 'bg-amber-100 text-amber-700',
  'Failed': 'bg-rose-100 text-rose-700',
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function CallsTable({ onOpenSummary, calls, agents }: CallsTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCalls = calls.filter(c => 
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contactId.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-t-2xl shrink-0">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t("callsTable.recentCalls")}</h2>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 tour-search-field">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t("callsTable.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 bg-slate-50 transition-all font-medium placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200">
            <tr>
              <th className="px-5 py-4 whitespace-nowrap">{t("callsTable.contact")}</th>
              <th className="px-5 py-4 whitespace-nowrap">{t("callsTable.agent")}</th>
              <th className="px-5 py-4 whitespace-nowrap">{t("callsTable.status")}</th>
              <th className="px-5 py-4 whitespace-nowrap">{t("callsTable.date")}</th>
              <th className="px-5 py-4 whitespace-nowrap">{t("callsTable.duration")}</th>
              <th className="px-5 py-4 whitespace-nowrap text-right">{t("callsTable.actions")}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredCalls.map((call) => {
              const agentName = agents.find(a => a.id === call.agentId)?.name || call.agentId;
              
              return (
                <React.Fragment key={call.id}>
                  <tr 
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onOpenSummary(call)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">{call.contactName}</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{call.contactId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{agentName}</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-bold">{call.callDirection}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm border border-transparent", statusColors[call.status] || 'bg-slate-100 text-slate-700')}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{format(new Date(call.createdAt), 'MMM dd, h:mm a')}</td>
                    <td className="px-5 py-4 font-mono text-slate-500 font-medium">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {formatDuration(call.duration)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSummary(call);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-slate-800 hover:-translate-y-0.5 transition-all tour-summary-button active:translate-y-0"
                      >
                        <TranscriptIcon className="w-3.5 h-3.5 mr-1.5" />
                        {t("callsTable.summary")}
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
            {filteredCalls.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-slate-400 font-medium text-sm">
                  {t("callsTable.noCalls")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="h-14 border-t border-slate-200 flex items-center justify-between px-5 shrink-0 bg-white rounded-b-2xl">
        <span className="text-sm text-slate-500 font-medium">
          {t("callsTable.showing", { count: filteredCalls.length, total: filteredCalls.length })}
        </span>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm">&laquo;</button>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg font-bold shadow-md">1</button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm">&raquo;</button>
        </div>
      </div>
    </div>
  );
}
