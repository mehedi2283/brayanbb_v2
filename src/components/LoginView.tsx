import { useState } from 'react';
import { Building2, Lock, Mail, Loader2, Globe } from 'lucide-react';
import { login } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const { t, language, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold shadow-sm border border-slate-200"
          title="Toggle Language"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'en' ? 'EN' : 'ES'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-black tracking-tight text-slate-900">{t("login.subtitle")}</h2>
        <p className="mt-3 text-center text-sm font-medium text-slate-500">{t("login.portal")}</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-12 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm border border-rose-100 text-center font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">{t("login.emailAddress")}</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 bg-slate-50 border border-slate-200 rounded-xl py-3.5 text-sm font-medium focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">{t("login.password")}</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 bg-slate-50 border border-slate-200 rounded-xl py-3.5 text-sm font-medium focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('login.signIn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
