import { useState } from 'react';
import { Location } from '../types';
import { Edit2, Check, X, Lock } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{t("subaccounts.title")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("subaccounts.description")}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">{t("subaccounts.locationName")}</th>
              <th className="px-6 py-4 font-semibold">{t("subaccounts.locationId")}</th>
              <th className="px-6 py-4 font-semibold">{t("subaccounts.status")}</th>
              <th className="px-6 py-4 font-semibold text-right">{t("callsTable.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loadingTokens ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>{t("subaccounts.loadingTokens")}
                  </div>
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t("subaccounts.noAccounts")}
                </td>
              </tr>
            ) : locations.map((loc) => {
              const hasToken = tokens[loc.id] === 'configured';
              const isSelected = selectedLocationId === loc.id;
              
              return (
                <tr key={loc.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">{loc.name} {isSelected && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{t("subaccounts.current")}</span>}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{loc.id}</td>
                  <td className="px-6 py-4">
                    {hasToken ? (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <Check className="w-3 h-3 mr-1" /> {t("subaccounts.configured")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3 mr-1" /> {t("subaccounts.missingToken")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setEditingLoc(loc);
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors tour-add-token"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> {hasToken ? t('subaccounts.update') : t('subaccounts.addToken')}
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
