/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { ChartRow } from './components/ChartRow';
import { CallsTable } from './components/CallsTable';
import { SummaryModal } from './components/SummaryModal';
import { SettingsView } from './components/SettingsView';
import { fetchLocations, fetchCallLogs, API_BASE_URL, fetchAgents, Agent } from './api';
import { CallLog, Location } from './types';
import { Edit2, Link as LinkIcon, Check, Copy, X, Lock, ChevronDown } from 'lucide-react';

function SubAccountsView({ 
  locations, 
  selectedLocationId,
  tokens,
  setTokens,
  loadingTokens,
  adminSecret,
  setAdminSecret
}: { 
  locations: Location[], 
  selectedLocationId: string,
  tokens: Record<string, string>,
  setTokens: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  loadingTokens: boolean,
  adminSecret: string,
  setAdminSecret: (val: string) => void
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
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-secret': adminSecret
          },
          body: JSON.stringify({ pitToken: editTokenValue })
        });
        setTokens(prev => ({ ...prev, [editingLoc.id]: 'configured' }));
        if (editingLoc.id === selectedLocationId) {
          // Token changed for current location, we will reload it when switching back to call logs view
        }
        setEditingLoc(null);
      } catch (err) {
        // Silently ignore to avoid triggering platform error overlay, error is handled gracefully.
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getMagicLink = (locId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?loc=${locId}`;
  };

  const handleCopy = (locId: string) => {
    const link = getMagicLink(locId);
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Admin Secret (Required to manage tokens)</label>
        <input
          type="password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          placeholder="Enter Admin Secret to view and edit configurations"
          className="w-full bg-white border border-slate-200 text-sm rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Sub-Account Name</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">Location ID</th>
              <th className="px-6 py-4 text-left font-semibold text-slate-600">API Key</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => {
              const hasToken = !!tokens[loc.id];
              return (
                <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{loc.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{loc.id}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {hasToken ? <span className="text-green-600 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Configured</span> : <span className="text-slate-400">Not Configured</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setEditingLoc(loc);
                          setEditTokenValue('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit API Key"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setLinkLoc(loc)}
                        disabled={!hasToken}
                        className={`p-1.5 rounded-md transition-colors ${hasToken ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-300 opacity-50 cursor-not-allowed'}`}
                        title={hasToken ? "Generate Magic Link" : "Configure API Key first"}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {locations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No sub-accounts found. Ensure your Agency API Key is configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingLoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row">
            {/* Instructions Side Panel */}
            <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 flex flex-col justify-center">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg mb-4">How to create a Token</h3>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-3">
                  <li>Go to <strong>Settings</strong> in your GoHighLevel account.</li>
                  <li>Select <strong>Private Integrations</strong>.</li>
                  <li>Click <strong>Create New API</strong>.</li>
                  <li>Ensure the following minimum scopes are selected:</li>
                </ol>
                <ul className="mt-3 space-y-2 ml-1">
                  <li className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded w-fit font-mono">agent-studio.readonly</li>
                  <li className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded w-fit font-mono">voice-ai-agent-goals.readonly</li>
                  <li className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded w-fit font-mono">voice-ai-agents.readonly</li>
                  <li className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded w-fit font-mono">voice-ai-dashboard.readonly</li>
                </ul>
              </div>
            </div>

            {/* Input Panel */}
            <div className="md:w-1/2 flex flex-col bg-white">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Configure API Key</h3>
                <button onClick={() => setEditingLoc(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Account</label>
                  <div className="text-sm text-slate-500">{editingLoc.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Private Integration Token (PIT)</label>
                  <input
                    type="password"
                    placeholder="Enter token..."
                    className="w-full bg-white border border-slate-200 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editTokenValue}
                    onChange={(e) => setEditTokenValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
                <button 
                  onClick={() => setEditingLoc(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveToken}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Applying...' : 'Apply Token'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {linkLoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Magic Link</h3>
              <button onClick={() => { setLinkLoc(null); setCopied(false); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600">
                Share this link with your client. They will only have access to call logs for <strong>{linkLoc.name}</strong>.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  className="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-md px-3 py-2 text-slate-500 outline-none"
                  value={getMagicLink(linkLoc.id)}
                />
                <button
                  onClick={() => handleCopy(linkLoc.id)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0 w-10 h-10"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={() => { setLinkLoc(null); setCopied(false); }}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => localStorage.getItem('ghl_location_id') || '');
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentView, setCurrentView] = useState<'call-logs' | 'sub-accounts' | 'settings'>('call-logs');
  const [isClientMode, setIsClientMode] = useState(() => sessionStorage.getItem('ghl_client_mode') === 'true');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  // Lifted state from SubAccountsView
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [adminSecret, setAdminSecret] = useState(() => sessionStorage.getItem('ghl_admin_secret') || '');

  const handleAdminSecretChange = (val: string) => {
    setAdminSecret(val);
    sessionStorage.setItem('ghl_admin_secret', val);
  };

  useEffect(() => {
    if (!adminSecret) {
      setTokens({});
      return;
    }
    setLoadingTokens(true);
    fetch(`${API_BASE_URL}/api/tokens`, {
      headers: { 'x-admin-secret': adminSecret }
    })
      .then(res => res.json())
      .then(data => {
        const t: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item.locationId) t[item.locationId] = 'configured';
          });
        }
        setTokens(t);
        setLoadingTokens(false);
      })
      .catch(err => {
        setLoadingTokens(false);
      });
  }, [adminSecret]);

  useEffect(() => {
    if (selectedLocationId) {
      localStorage.setItem('ghl_location_id', selectedLocationId);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicLoc = params.get('loc');
    
    let activeLocId = selectedLocationId;

    if (magicLoc) {
      localStorage.setItem('ghl_location_id', magicLoc);
      setSelectedLocationId(magicLoc);
      activeLocId = magicLoc;
      setCurrentView('call-logs');
      setIsClientMode(true);
      sessionStorage.setItem('ghl_client_mode', 'true');
      // Remove params from URL so it doesn't linger
      window.history.replaceState({}, '', window.location.pathname);
    }

    setLoading(true);
    fetchLocations().then(locs => {
      setLocations(locs);
      
      const inClientMode = sessionStorage.getItem('ghl_client_mode') === 'true' || !!magicLoc;

      if (locs.length > 0) {
        if (!activeLocId || !locs.find(l => l.id === activeLocId)) {
          if (!inClientMode) {
            setSelectedLocationId(locs[0].id);
          } else {
            // In client mode, do NOT fallback to another location.
            // If their location is not found (or invalid), we keep it as is,
            // the data fetch will just fail or return empty if unauthorized.
          }
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [currentView]);

  useEffect(() => {
    if (selectedLocationId && currentView === 'call-logs') {
      // If we have an adminSecret, check if tokens have been loaded and if the selected location is configured.
      // If not configured, we immediately lock the page.
      if (adminSecret && Object.keys(tokens).length > 0 && tokens[selectedLocationId] !== 'configured') {
        setCalls([]);
        setAgents([]);
        setIsPreviewMode(false);
        setErrorMsg('No Private Integration Token configured for this Sub-Account. Please configure it in the Sub-Accounts tab.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      
      Promise.all([
        fetchCallLogs(selectedLocationId),
        fetchAgents(selectedLocationId)
      ])
        .then(([callData, agentData]) => {
          setCalls(callData);
          setAgents(agentData);
          setLoading(false);
          setIsPreviewMode(false);
        })
        .catch(err => {
          const errMsg = err.message || '';
          if (errMsg.includes('Invalid Private Integration token') || errMsg.includes('Invalid token')) {
            localStorage.removeItem('ghl_sub_account_token');
            setCalls([]);
            setAgents([]);
            setIsPreviewMode(false);
            setErrorMsg('Invalid Private Integration Token. Please enter a valid one in Sub-Accounts.');
          } else if (errMsg.includes('No Private Integration Token configured')) {
            setCalls([]);
            setAgents([]);
            setIsPreviewMode(false);
            setErrorMsg('No Private Integration Token configured for this Sub-Account. Please configure it in the Sub-Accounts tab.');
          } else {
            setErrorMsg(errMsg || 'An error occurred while fetching data.');
            setCalls([]);
            setAgents([]);
            setIsPreviewMode(false);
          }
          setLoading(false);
        });
    }
  }, [selectedLocationId, currentView, tokens, adminSecret]);

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const callDate = new Date(call.createdAt);
      const [start, end] = dateRange;
      
      if (start) {
        const startDay = new Date(start);
        startDay.setHours(0, 0, 0, 0);
        if (callDate < startDay) return false;
      }
      
      if (end) {
        const endDay = new Date(end);
        endDay.setHours(23, 59, 59, 999);
        if (callDate > endDay) return false;
      }
      
      if (selectedAgentId !== 'all' && call.agentId !== selectedAgentId) {
        return false;
      }
      
      return true;
    });
  }, [calls, dateRange, selectedAgentId]);

  const metrics = useMemo(() => {
    const total = filteredCalls.length;
    const humanAnswered = filteredCalls.filter(c => c.status === 'Human Answered').length;
    const voicemail = filteredCalls.filter(c => c.status === 'Voicemail').length;
    const noAnswer = filteredCalls.filter(c => c.status === 'No Answer').length;
    const failed = filteredCalls.filter(c => c.status === 'Failed').length;
    const unattempted = filteredCalls.filter(c => c.status === 'Unattempted').length;
    const actionsTriggered = filteredCalls.reduce((acc, call) => acc + call.actionsTriggered, 0);

    return {
      attempted: total - unattempted,
      connected: humanAnswered,
      actionsTriggered,
      unattempted,
      humanAnswered,
      voicemail,
      noAnswer,
      failed
    };
  }, [filteredCalls]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        locations={locations}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        isClientMode={isClientMode}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          isClientMode={isClientMode} 
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        
        <div className="p-5 space-y-5 overflow-auto flex-1 relative">
          {currentView === 'settings' ? (
            <SettingsView 
              adminSecret={adminSecret}
              setAdminSecret={handleAdminSecretChange}
            />
          ) : currentView === 'sub-accounts' ? (
            <SubAccountsView 
              locations={locations} 
              selectedLocationId={selectedLocationId}
              tokens={tokens}
              setTokens={setTokens}
              loadingTokens={loadingTokens}
              adminSecret={adminSecret}
              setAdminSecret={handleAdminSecretChange}
            />
          ) : (
            <>
              {errorMsg ? (
                <div className="flex flex-col items-center justify-center h-[80vh] w-full">
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">API Token Required</h3>
                    <p className="text-sm text-slate-600 mb-6">
                      {errorMsg}
                    </p>
                    <button 
                      onClick={() => setCurrentView('sub-accounts')}
                      className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Configure API Token
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isPreviewMode && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-amber-700 font-medium">
                            Preview Mode (Unauthorized Token)
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Your token is missing the required scopes (<code>voice-ai-dashboard.readonly</code>) or is invalid. GoHighLevel restricts Agency API keys from accessing Sub-Account call logs. Showing mock data for demonstration. To view actual call logs, please enter a valid Sub-Account PIT in Settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <button 
                          onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsAgentDropdownOpen(false), 200)}
                          className="bg-white border border-slate-200 text-sm rounded-md px-3 py-1.5 font-medium outline-none focus:border-blue-500 flex items-center justify-between min-w-[140px]"
                        >
                          <span className="truncate">
                            {selectedAgentId === 'all' ? 'All Agents' : agents.find(a => a.id === selectedAgentId)?.name || 'Unknown Agent'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-500 ml-2" />
                        </button>
                        {isAgentDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
                            <button
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedAgentId === 'all' ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white' : 'text-slate-700'}`}
                              onClick={() => { setSelectedAgentId('all'); setIsAgentDropdownOpen(false); }}
                            >
                              All Agents
                            </button>
                            {agents.map(agent => (
                              <button
                                key={agent.id}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedAgentId === agent.id ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white' : 'text-slate-700'}`}
                                onClick={() => { setSelectedAgentId(agent.id); setIsAgentDropdownOpen(false); }}
                              >
                                {agent.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Total {filteredCalls.length} records found</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard title="Attempted Calls" value={metrics.attempted} />
                    <MetricCard title="Connected Calls" value={metrics.connected} />
                    <MetricCard title="Actions Triggered" value={metrics.actionsTriggered} />
                  </div>

                  <ChartRow 
                    humanAnswered={metrics.humanAnswered}
                    voicemail={metrics.voicemail}
                    noAnswer={metrics.noAnswer}
                    failed={metrics.failed}
                  />

                  <CallsTable 
                    calls={filteredCalls} 
                    agents={agents}
                    onOpenSummary={setSelectedCall} 
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <SummaryModal call={selectedCall} onClose={() => setSelectedCall(null)} />

    </div>
  );
}
