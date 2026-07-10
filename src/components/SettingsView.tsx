import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { Save, Lock, HelpCircle } from 'lucide-react';
import { API_BASE_URL, authHeaders, changePassword } from '../api';

interface SettingsViewProps {
  user: any;
  onRestartTutorial: () => void;
  onAgencyKeyUpdated?: () => void;
}

export function SettingsView({ user, onRestartTutorial, onAgencyKeyUpdated }: SettingsViewProps) {
  const { t, language, setLanguage } = useLanguage();

  const [agencyKey, setAgencyKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleSaveKey = async () => {
    setSavingKey(true);
    setKeyMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/agency-key`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ agencyApiKey: agencyKey })
      });
      const data = await res.json();
      if (res.ok) {
        setKeyMessage(t('settings.keySaved'));
        setAgencyKey('');
        if (onAgencyKeyUpdated) onAgencyKeyUpdated();
      } else {
        setKeyMessage(data.error || t('settings.keyFailed'));
      }
    } catch (err) {
      console.error(err);
      setKeyMessage(t('settings.keyError'));
    } finally {
      setSavingKey(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage('');
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordMessage(t('settings.passwordSaved'));
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMessage(err.message || t('settings.passwordFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-6">
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t("settings.help")}</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">{t("settings.helpDesc")}</p>
            </div>
          </div>
          <button
            onClick={onRestartTutorial}
            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            {t("tutorial.start")}
          </button>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("settings.agencySettings")}</h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">{t("settings.agencySettingsDesc")}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="tour-settings-api-key max-w-xl">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t("settings.newAgencyKey")}</label>
              <input
                type="password"
                value={agencyKey}
                onChange={(e) => setAgencyKey(e.target.value)}
                placeholder={t("settings.newAgencyKeyPlaceholder")}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-5 py-3 focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all"
              />
              <p className="text-xs text-slate-400 mt-2 font-medium">{t("settings.agencyKeyHint")}</p>
            </div>
            
            {keyMessage && (
              <div className={`text-sm p-4 rounded-xl font-medium max-w-xl ${keyMessage.includes('success') || keyMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {keyMessage}
              </div>
            )}

            <div className="flex pt-4">
              <button
                onClick={handleSaveKey}
                disabled={savingKey || !agencyKey}
                className="flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingKey ? t('settings.saving') : t('settings.saveSettings')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("settings.security")}</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">{t("settings.securityDesc")}</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleUpdatePassword} className="space-y-6 tour-settings-password max-w-xl">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t("settings.oldPassword")}</label>
              <input
                required
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t("settings.oldPasswordPlaceholder")}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-5 py-3 focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t("settings.newPassword")}</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("settings.newPasswordPlaceholder")}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-5 py-3 focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all"
              />
            </div>
            
            {passwordMessage && (
              <div className={`text-sm p-4 rounded-xl font-medium ${passwordMessage.includes('success') || passwordMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {passwordMessage}
              </div>
            )}

            <div className="flex pt-4">
              <button
                type="submit"
                disabled={savingPassword || !oldPassword || !newPassword}
                className="flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                {savingPassword ? t('settings.updating') : t('settings.updatePassword')}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
