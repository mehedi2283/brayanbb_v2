import { Phone, Settings, Building, ChevronDown, Users } from 'lucide-react';
import { Location } from '../types';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: 'call-logs' | 'sub-accounts' | 'settings' | 'users';
  onViewChange: (view: 'call-logs' | 'sub-accounts' | 'settings' | 'users') => void;
  locations: Location[];
  selectedLocationId: string;
  onLocationChange: (id: string) => void;
  isClientMode: boolean;
}

export function Sidebar({ currentView, onViewChange, locations, selectedLocationId, onLocationChange, isClientMode }: SidebarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 flex flex-col h-full shrink-0">
      <div className="p-8 flex items-center space-x-4">
        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
          V
        </div>
        <span className="text-slate-900 font-bold text-xl tracking-tight">{t("sidebar.title")}</span>
      </div>
      
      <div className="px-6 mb-8 relative tour-subaccount-select" ref={dropdownRef}>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">{t("sidebar.subAccount")}</label>
        <button
          className={`w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-xl px-4 py-3 outline-none flex items-center justify-between transition-all shadow-sm ${isClientMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-50'}`}
          onClick={() => !isClientMode && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isClientMode}
        >
          <span className="truncate pr-2">
            {selectedLocation ? selectedLocation.name : t('sidebar.selectLocation')}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        {isDropdownOpen && !isClientMode && (
          <div className="absolute top-full left-6 right-6 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 z-50 max-h-60 overflow-y-auto py-1.5">
            {locations.length > 0 ? locations.map((loc) => (
              <button
                key={loc.id}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors",
                  selectedLocationId === loc.id ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
                onClick={() => {
                  onLocationChange(loc.id);
                  setIsDropdownOpen(false);
                }}
              >
                {loc.name}
              </button>
            )) : (
              <div className="px-4 py-3 text-sm text-slate-500 font-medium italic">{t("sidebar.noSubAccounts")}</div>
            )}
          </div>
        )}
      </div>

      <nav className="mt-2 flex-1 px-4 space-y-1">
        <div className="px-4 mb-4 mt-6 text-slate-400 text-[10px] uppercase font-bold tracking-widest">{t("sidebar.mainMenu")}</div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onViewChange('call-logs'); }}
          className={`flex items-center px-4 py-3 rounded-xl group transition-all tour-nav-call-logs ${currentView === 'call-logs' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Phone className={`w-5 h-5 mr-3 ${currentView === 'call-logs' ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span className="text-sm font-semibold">{t('nav.callLogs')}</span>
        </a>
        
        {!isClientMode && (
          <>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onViewChange('sub-accounts'); }}
              className={`flex items-center px-4 py-3 rounded-xl group transition-all tour-nav-sub-accounts ${currentView === 'sub-accounts' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Building className={`w-5 h-5 mr-3 ${currentView === 'sub-accounts' ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="text-sm font-semibold">{t('nav.subAccounts')}</span>
            </a>
            
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onViewChange('users'); }}
              className={`flex items-center px-4 py-3 rounded-xl group transition-all tour-nav-users ${currentView === 'users' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Users className={`w-5 h-5 mr-3 ${currentView === 'users' ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="text-sm font-semibold">{t('nav.users')}</span>
            </a>
          </>
        )}

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onViewChange('settings'); }}
          className={`flex items-center px-4 py-3 rounded-xl group transition-all tour-nav-settings ${currentView === 'settings' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Settings className={`w-5 h-5 mr-3 ${currentView === 'settings' ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span className="text-sm font-semibold">{t('nav.settings')}</span>
        </a>
      </nav>

      <div className="p-8 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
          GHL Admin v3.0
        </div>
      </div>
    </aside>
  );
}
