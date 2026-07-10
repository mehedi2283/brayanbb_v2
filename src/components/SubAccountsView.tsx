import { useState } from 'react';
import { Location } from '../types';
import { Edit2, Check, Lock } from 'lucide-react';
import { ConfigureTokenModal } from './ConfigureTokenModal';
import { useLanguage } from '../contexts/LanguageContext';

export function SubAccountsView({ 
  locations, 
  selectedLocationId,
  tokens,
  setTokens,
  loadingTokens
}: { 
  locations: Location[], 
  selectedLocationId: string,
  tokens: Record<string, string>,
  setTokens: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  loadingTokens: boolean
}) {
  const { t } = useLanguage();
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("subaccounts.title")}</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">{t("subaccounts.description")}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">{t("subaccounts.locationName")}</th>
              <th className="px-8 py-4">{t("subaccounts.locationId")}</th>
              <th className="px-8 py-4">{t("subaccounts.status")}</th>
              <th className="px-8 py-4 text-right">{t("callsTable.actions")}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loadingTokens ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium">
                  <div className="flex justify-center items-center">
                    <div className="flex items-end space-x-1 h-4 mr-3">
                      <div className="w-1 bg-slate-800 rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0ms' }}></div>
                      <div className="w-1 bg-slate-800 rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '200ms' }}></div>
                      <div className="w-1 bg-slate-800 rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '400ms' }}></div>
                    </div>
                    {t("subaccounts.loadingTokens")}
                  </div>
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium">
                  {t("subaccounts.noAccounts")}
                </td>
              </tr>
            ) : locations.map((loc) => {
              const hasToken = tokens[loc.id] === 'configured';
              const isSelected = selectedLocationId === loc.id;
              
              return (
                <tr key={loc.id} className={`border-b border-slate-100 transition-colors ${isSelected ? 'bg-slate-100/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-8 py-4">
                    <span className="font-semibold text-slate-900">{loc.name}</span>
                    {isSelected && <span className="ml-3 text-[10px] bg-slate-200 text-slate-800 px-2 py-1 rounded-md font-bold uppercase tracking-wider">{t("subaccounts.current")}</span>}
                  </td>
                  <td className="px-8 py-4 font-mono text-xs text-slate-500">{loc.id}</td>
                  <td className="px-8 py-4">
                    {hasToken ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        <Check className="w-3.5 h-3.5 mr-1.5" /> {t("subaccounts.configured")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                        <Lock className="w-3.5 h-3.5 mr-1.5" /> {t("subaccounts.missingToken")}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => setEditingLoc(loc)}
                      className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm tour-add-token hover:shadow"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-2" /> {hasToken ? t('subaccounts.update') : t('subaccounts.addToken')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingLoc && (
        <ConfigureTokenModal 
          location={editingLoc}
          onClose={() => setEditingLoc(null)}
          onSuccess={() => {
            setTokens(prev => ({ ...prev, [editingLoc.id]: 'configured' }));
            setEditingLoc(null);
          }}
        />
      )}
    </div>
  );
}
