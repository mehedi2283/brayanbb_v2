import { X, FileText, AlignLeft, Info, Calendar, Clock, User, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { CallLog } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface SummaryModalProps {
  call: CallLog | null;
  onClose: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function SummaryModal({ call, onClose }: SummaryModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="w-[500px] h-full bg-white shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10 sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("summaryModal.callDetails")}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{call.contactName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 mt-2 shrink-0 space-x-6">
          <button 
            onClick={() => setActiveTab('summary')}
            className={cn(
              "pb-3 text-sm font-bold border-b-2 transition-colors tour-modal-summary-tab uppercase tracking-wider", 
              activeTab === 'summary' ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {t("summaryModal.summaryTab")}
          </button>
          <button 
            onClick={() => setActiveTab('transcript')}
            className={cn(
              "pb-3 text-sm font-bold border-b-2 transition-colors tour-modal-transcript-tab uppercase tracking-wider", 
              activeTab === 'transcript' ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {t("summaryModal.transcriptTab")}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-8 bg-slate-50/50">
          
          {activeTab === 'summary' && (
            <div className="space-y-6 ">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="flex items-center text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <AlignLeft className="w-4 h-4 mr-2 text-slate-900" />
                  {t("summaryModal.summaryTab")}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {call.summary || t('summaryModal.noSummary')}
                </p>
              </div>

              <div className="tour-modal-metadata space-y-3">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">{t("summaryModal.metadata")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("summaryModal.agentId")}</span>
                    <span className="font-semibold text-slate-900 text-sm truncate">{call.agentId}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("summaryModal.contactId")}</span>
                    <span className="font-semibold text-slate-900 text-sm truncate">{call.contactId}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("summaryModal.duration")}</span>
                    <span className="font-bold text-slate-900 text-sm font-mono tracking-tight">{formatDuration(call.duration)}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("summaryModal.trialCall")}</span>
                    <span className="font-semibold text-slate-900 text-sm">{call.trialCall ? t('summaryModal.yes') : t('summaryModal.no')}</span>
                  </div>
                </div>
              </div>

              {Object.keys(call.extractedData).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">{t("summaryModal.extractedData")}</h3>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    {Object.entries(call.extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-slate-500 capitalize tracking-wide">{key}</span>
                        <span className="text-sm font-semibold text-slate-900">{value as React.ReactNode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-4 ">
              <h3 className="flex items-center text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide pl-2">
                <FileText className="w-4 h-4 mr-2 text-slate-900" />
                {t("summaryModal.transcriptTab")}
              </h3>
              
              <div className="space-y-5">
                {call.transcript.length > 0 ? call.transcript.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'bot' ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{msg.role === 'bot' ? 'Agent' : 'Customer'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm border ${
                      msg.role === 'bot' 
                        ? 'bg-white border-slate-200 text-slate-800 rounded-tl-sm' 
                        : 'bg-slate-900 border-slate-900 text-white rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 italic text-center py-10 bg-white rounded-2xl border border-slate-200">{t("summaryModal.noTranscript")}</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
