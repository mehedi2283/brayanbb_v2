import { useState } from 'react';
import { Location } from '../types';
import { Edit2, Link as LinkIcon, Check, Copy, X, Lock } from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../api';

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
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [editTokenValue, setEditTokenValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [linkLoc, setLinkLoc] = useState<Location | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveToken = async () => {
    if (editingLoc) {
      setIsSaving(true);
      try {
        await fetch(`${API_BASE_URL}/api/tokens/${editingLoc.id}`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ pitToken: editTokenValue })
        });
        setTokens(prev => ({ ...prev, [editingLoc.id]: 'configured' }));
        setEditingLoc(null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCopyLink = (loc: Location) => {
    const url = new URL(window.location.origin);
    url.searchParams.set('loc', loc.id);
    navigator.clipboard.writeText(url.toString());
    setLinkLoc(loc);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setLinkLoc(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Sub-Accounts</h2>
          <p className="text-sm text-slate-500 mt-1">Manage Private Integration Tokens for your sub-accounts.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Location Name</th>
              <th className="px-6 py-4 font-semibold">Location ID</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingTokens ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading tokens...
                  </div>
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No sub-accounts found. Check your Agency API key in Settings.
                </td>
              </tr>
            ) : locations.map((loc) => {
              const hasToken = tokens[loc.id] === 'configured';
              const isSelected = selectedLocationId === loc.id;
              
              return (
                <tr key={loc.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">{loc.name} {isSelected && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">CURRENT</span>}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{loc.id}</td>
                  <td className="px-6 py-4">
                    {hasToken ? (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <Check className="w-3 h-3 mr-1" /> Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3 mr-1" /> Missing Token
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setEditingLoc(loc);
                        setEditTokenValue('');
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> {hasToken ? 'Update' : 'Add Token'}
                    </button>
                    <button 
                      onClick={() => handleCopyLink(loc)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors relative"
                    >
                      {linkLoc?.id === loc.id && copied ? (
                        <><Check className="w-3 h-3 mr-1 text-green-600" /> Copied!</>
                      ) : (
                        <><LinkIcon className="w-3 h-3 mr-1" /> Copy Magic Link</>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingLoc && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Configure Token</h3>
              <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Enter the Private Integration Token (PIT) for <span className="font-semibold text-slate-800">{editingLoc.name}</span>.
            </p>
            <input
              type="password"
              placeholder="Paste PIT token here..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-4"
              value={editTokenValue}
              onChange={e => setEditTokenValue(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setEditingLoc(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveToken}
                disabled={isSaving || !editTokenValue}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
