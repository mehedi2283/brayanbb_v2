import { useLanguage } from '../contexts/LanguageContext';

export function WaveformLoader() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] w-full space-y-6">
      <div className="flex items-center space-x-1.5 h-16">
        <div className="w-2.5 bg-slate-800 rounded-full animate-bounce" style={{ height: '24px', animationDelay: '0ms', animationDuration: '1s' }}></div>
        <div className="w-2.5 bg-slate-800 rounded-full animate-bounce" style={{ height: '40px', animationDelay: '100ms', animationDuration: '1s' }}></div>
        <div className="w-2.5 bg-slate-800 rounded-full animate-bounce" style={{ height: '56px', animationDelay: '200ms', animationDuration: '1s' }}></div>
        <div className="w-2.5 bg-slate-800 rounded-full animate-bounce" style={{ height: '40px', animationDelay: '300ms', animationDuration: '1s' }}></div>
        <div className="w-2.5 bg-slate-800 rounded-full animate-bounce" style={{ height: '24px', animationDelay: '400ms', animationDuration: '1s' }}></div>
      </div>
      <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">{t("app.loadingCallLogs") || 'LOADING CALL LOGS...'}</p>
    </div>
  );
}
