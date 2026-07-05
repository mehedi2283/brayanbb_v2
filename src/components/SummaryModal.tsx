import { X } from 'lucide-react';
import { useState } from 'react';
import { CallLog } from '../types';
import { cn } from '../lib/utils';

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
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="w-[450px] h-full bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Call Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 px-4 mt-2">
          <button 
            onClick={() => setActiveTab('summary')}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", 
              activeTab === 'summary' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Summary
          </button>
          <button 
            onClick={() => setActiveTab('transcript')}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", 
              activeTab === 'transcript' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Transcript
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-6">
          {activeTab === 'summary' && (
            <>
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Summary</h3>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700">
                  {call.summary || 'No summary available.'}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Metadata</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div><span className="text-slate-500 block mb-1">Agent ID</span><span className="font-medium text-slate-800">{call.agentId}</span></div>
                  <div><span className="text-slate-500 block mb-1">Contact ID</span><span className="font-medium text-slate-800">{call.contactId}</span></div>
                  <div><span className="text-slate-500 block mb-1">Duration</span><span className="font-medium text-slate-800">{formatDuration(call.duration)}</span></div>
                  <div><span className="text-slate-500 block mb-1">Trial Call</span><span className="font-medium text-slate-800">{call.trialCall ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              {Object.keys(call.extractedData).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase">Extracted Data</h3>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-2">
                    {Object.entries(call.extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-500 capitalize">{key}</span>
                        <span className="font-medium text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase">Transcript</h3>
              <div className="space-y-4">
                {call.transcript.length > 0 ? call.transcript.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'bot' ? 'items-start' : 'items-end'}`}>
                    <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${
                      msg.role === 'bot' 
                        ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{msg.timestamp}</span>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 italic">No transcript available.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
