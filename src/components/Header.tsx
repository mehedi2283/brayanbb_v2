import { Calendar, X, LogOut, User, Globe } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  isClientMode?: boolean;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  user?: any;
  onLogout?: () => void;
}

export function Header({ isClientMode, dateRange, setDateRange, user, onLogout }: HeaderProps) {
  const [startDate, endDate] = dateRange;
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100 flex items-center justify-between px-8 shrink-0 gap-4 sticky top-0 z-30">
      <div className="flex-1"></div>
      
      <div className="flex items-center space-x-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium tour-language-toggle"
          title="Toggle Language"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'en' ? 'EN' : 'ES'}</span>
        </button>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 transition-colors group relative w-[260px] shrink-0 tour-date-picker">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <DatePicker
              selectsRange={true}
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              onChange={(update) => setDateRange(update)}
              dateFormat="MMM d, yyyy"
              className="bg-transparent text-sm text-slate-700 font-medium outline-none border-none focus:ring-0 p-0 w-full text-left cursor-pointer caret-transparent select-none pr-6 truncate"
              wrapperClassName="w-full"
              placeholderText={t('header.selectDate')}
              onChangeRaw={(e) => e.preventDefault()}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => setDateRange([null, null])} 
              className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors bg-white hover:bg-slate-100 rounded-full p-1 flex items-center justify-center z-10 shadow-sm border border-slate-200"
              title={t('header.clearDate')}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        
        {user && (
          <div className="flex items-center pl-6 border-l border-slate-200 space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900 leading-tight">{user?.email}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{user?.role === "client" ? t("users.client") : t("users.admin")}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title={t("header.logout")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
