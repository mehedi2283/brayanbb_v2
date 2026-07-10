import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Location } from '../types';
import { API_BASE_URL, authHeaders } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfigureTokenModalProps {
  location: Location;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export function ConfigureTokenModal({ location, onClose, onSuccess }: ConfigureTokenModalProps) {
  const { t } = useLanguage();
  const [editTokenValue, setEditTokenValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedScope, setCopiedScope] = useState<string | null>(null);

  const scopesList = [
    { label: t('modal.viewAgents'), value: 'agent-studio.readonly' },
    { label: t('modal.viewGoals'), value: 'voice-ai-agent-goals.readonly' },
    { label: t('modal.viewVoiceAgents'), value: 'voice-ai-agents.readonly' },
    { label: t('modal.viewDashboard'), value: 'voice-ai-dashboard.readonly' }
  ];

  const handleCopyScope = (scope: string) => {
    navigator.clipboard.writeText(scope);
    setCopiedScope(scope);
    setTimeout(() => setCopiedScope(null), 2000);
  };

  const handleSaveToken = async () => {
    setIsSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/tokens/${location.id}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pitToken: editTokenValue, locationName: location.name })
      });
      onSuccess(editTokenValue);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{t("modal.configureToken")}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 tour-configure-token-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {t('modal.enterToken', { name: location.name })}
        </p>
        <input
          type="password"
          placeholder={t("modal.pasteToken")}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 text-sm mb-4 tour-configure-token-input"
          value={editTokenValue}
          onChange={e => setEditTokenValue(e.target.value)}
        />
        
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="font-semibold text-slate-800 text-xs mb-3">{t("modal.requiredScopes")}</p>
          <div className="flex flex-wrap gap-2">
            {scopesList.map(scope => (
              <button
                key={scope.value}
                onClick={() => handleCopyScope(scope.value)}
                className="inline-flex items-center text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-full hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-colors"
                title={`Copy ${scope.value}`}
              >
                {scope.label} - <span className="font-mono ml-1 text-slate-500">{scope.value}</span>
                {copiedScope === scope.value ? (
                  <Check className="w-3 h-3 ml-1.5 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 ml-1.5 opacity-40 group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">{t("modal.howToFind")}</p>
          <ol className="list-decimal list-inside space-y-1 ml-1">
            <li>{t("modal.step1")}</li>
            <li>{t("modal.step2")}</li>
            <li>{t("modal.step3")}</li>
            <li>{t("modal.step4")}</li>
            <li>{t("modal.step5")}</li>
          </ol>
        </div>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveToken}
            disabled={isSaving || !editTokenValue}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 tour-save-token"
          >
            {isSaving ? t('modal.saving') : t('modal.saveToken')}
          </button>
        </div>
      </div>
    </div>
  );
}
