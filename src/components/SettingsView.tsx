import { useState } from 'react';
import { Save } from 'lucide-react';
import { API_BASE_URL } from '../api';

interface SettingsViewProps {
  adminSecret: string;
  setAdminSecret: (val: string) => void;
}

export function SettingsView({ adminSecret, setAdminSecret }: SettingsViewProps) {
  const [agencyKey, setAgencyKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/agency-key`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({ agencyApiKey: agencyKey })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Agency API Key saved successfully.');
        setAgencyKey('');
      } else {
        setMessage(data.error || 'Failed to save Agency API Key.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error saving key.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto mt-10">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800">Agency Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure your GoHighLevel Agency API settings securely.</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Admin Secret</label>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Enter Admin Secret to authenticate"
            className="w-full bg-white border border-slate-200 text-sm rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            Required to save configuration changes. This is the ADMIN_SECRET configured in the backend environment.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New Agency API Key</label>
          <input
            type="password"
            value={agencyKey}
            onChange={(e) => setAgencyKey(e.target.value)}
            placeholder="Enter new Agency API Key to update"
            className="w-full bg-white border border-slate-200 text-sm rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-2">
            This key is used to fetch the list of sub-accounts from GoHighLevel. For security, the current key is not displayed.
          </p>
        </div>
        
        {message && (
          <div className={`text-sm p-3 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !adminSecret || !agencyKey}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
