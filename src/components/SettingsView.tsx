import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import { API_BASE_URL, authHeaders, changePassword } from '../api';

interface SettingsViewProps {
  user: any;
}

export function SettingsView({ user }: SettingsViewProps) {
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
    <div className="space-y-6 max-w-2xl mx-auto mt-6">
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">{t("settings.agencySettings")}</h2>
            <p className="text-sm text-slate-500 mt-1">{t("settings.agencySettingsDesc")}</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("settings.newAgencyKey")}</label>
              <input
                type="password"
                value={agencyKey}
                onChange={(e) => setAgencyKey(e.target.value)}
                placeholder={t("settings.newAgencyKeyPlaceholder")}
                className="w-full bg-white border border-slate-200 text-sm rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">{t("settings.agencyKeyHint")}</p>
            </div>
            
            {keyMessage && (
              <div className={`text-sm p-3 rounded-md ${keyMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {keyMessage}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveKey}
                disabled={savingKey || !agencyKey}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingKey ? t('settings.saving') : t('settings.saveSettings')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">{t("settings.security")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("settings.securityDesc")}</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("settings.oldPassword")}</label>
              <input
                required
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t("settings.oldPasswordPlaceholder")}
                className="w-full bg-white border border-slate-200 text-sm rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t("settings.newPassword")}</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("settings.newPasswordPlaceholder")}
                className="w-full bg-white border border-slate-200 text-sm rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            {passwordMessage && (
              <div className={`text-sm p-3 rounded-md ${passwordMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {passwordMessage}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={savingPassword || !oldPassword || !newPassword}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
