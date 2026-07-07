import { Phone, Settings, Building, ChevronDown, Users } from 'lucide-react';
import { Location } from '../types';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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
    <aside className="w-[240px] bg-[#0F172A] flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          V
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">{t("sidebar.title")}</span>
      </div>
      
      <div className="px-6 mb-4 relative" ref={dropdownRef}>
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">{t("sidebar.subAccount")}</label>
        <button
          className={`w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none flex items-center justify-between transition-colors ${isClientMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600 focus:border-blue-500'}`}
          onClick={() => !isClientMode && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isClientMode}
        >
          <span className="truncate pr-2">
            {selectedLocation ? selectedLocation.name : t('sidebar.selectLocation')}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        {isDropdownOpen && !isClientMode && (
          <div className="absolute top-full left-6 right-6 mt-1 bg-[#1E293B] border border-slate-700 rounded-md shadow-xl z-20 max-h-60 overflow-y-auto py-1">
            {locations.length > 0 ? locations.map((loc) => (
              <button
                key={loc.id}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedLocationId === loc.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                onClick={() => {
                  onLocationChange(loc.id);
                  setIsDropdownOpen(false);
                }}
              >
                {loc.name}
              </button>
            )) : (
              <div className="px-3 py-2 text-sm text-slate-500">{t("sidebar.noSubAccounts")}</div>
            )}
          </div>
        )}
      </div>

      <nav className="mt-2 flex-1">
        <div className="px-6 mb-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">{t("sidebar.mainMenu")}</div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onViewChange('call-logs'); }}
          className={`flex items-center px-6 py-3 group ${currentView === 'call-logs' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <Phone className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">{t('nav.callLogs')}</span>
        </a>
        
        {!isClientMode && (
          <>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onViewChange('sub-accounts'); }}
              className={`flex items-center px-6 py-3 group ${currentView === 'sub-accounts' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Building className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{t('nav.subAccounts')}</span>
            </a>
            
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onViewChange('users'); }}
              className={`flex items-center px-6 py-3 group ${currentView === 'users' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Users className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{t('nav.users')}</span>
            </a>
          </>
        )}

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onViewChange('settings'); }}
          className={`flex items-center px-6 py-3 group ${currentView === 'settings' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <Settings className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">{t('nav.settings')}</span>
        </a>
      </nav>

      <div className="p-6 border-t border-slate-800 flex items-center justify-between">
        <div className="text-slate-400 text-xs italic">
          GHL Admin v3.0
        </div>
      </div>
    </aside>
  );
}
