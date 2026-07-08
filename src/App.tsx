import { useState, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { ChartRow } from './components/ChartRow';
import { CallsTable } from './components/CallsTable';
import { SummaryModal } from './components/SummaryModal';
import { SettingsView } from './components/SettingsView';
import { Tutorial } from './components/Tutorial';
import { SubAccountsView } from './components/SubAccountsView';
import { UsersView } from './components/UsersView';
import { LoginView } from './components/LoginView';
import { ConfigureTokenModal } from './components/ConfigureTokenModal';
import { useLanguage } from './contexts/LanguageContext';
import { fetchLocations, fetchCallLogs, API_BASE_URL, fetchAgents, Agent, authHeaders, saveTutorialComplete } from './api';
import { CallLog, Location } from './types';
import { Lock, ChevronDown, UserCheck } from 'lucide-react';

export default function App() {
  const { t } = useLanguage();
  const [runTutorial, setRunTutorial] = useState(false);
  const [user, setUser] = useState<any>(() => {
    const saved = sessionStorage.getItem('ghl_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => localStorage.getItem('ghl_location_id') || '');
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentView, setCurrentView] = useState<'call-logs' | 'sub-accounts' | 'settings' | 'users'>('call-logs');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);

  const isClientMode = user?.role === 'client';

  // Lifted state from SubAccountsView
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [loadingTokens, setLoadingTokens] = useState(false);

useEffect(() => {
    if (!user) {
      setTokens({});
      return;
    }
    
    if (user?.role === 'admin') {
      setLoadingTokens(true);
      fetch(`${API_BASE_URL}/api/tokens`, { headers: authHeaders() })
        .then(res => res.json())
        .then(data => {
          const t: Record<string, string> = {};
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.locationId && item.hasToken) t[item.locationId] = 'configured';
            });
          }
          setTokens(t);
          setLoadingTokens(false);
        })
        .catch(err => {
          setLoadingTokens(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (selectedLocationId) {
      localStorage.setItem('ghl_location_id', selectedLocationId);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchLocations().then(locs => {
      setLocations(locs);
      
      if (locs.length > 0) {
        if (!selectedLocationId || !locs.find(l => l.id === selectedLocationId)) {
          if (user?.role !== 'client') {
            setSelectedLocationId(locs[0].id);
          } else {
            // For clients, if they have a single location assigned, lock to it
            setSelectedLocationId(locs[0].id);
          }
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user, currentView]);

  useEffect(() => {
    if (user && selectedLocationId && currentView === 'call-logs') {
      // If we have an admin user, check if tokens have been loaded and if the selected location is configured.
      if (user?.role === 'admin' && Object.keys(tokens).length > 0 && tokens[selectedLocationId] !== 'configured') {
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
          setCalls([]);
          setAgents([]);
          // Just show the actual backend error instead of generic ones
          setErrorMsg(err.message || 'Failed to fetch data.');
          setLoading(false);
        });
    }
  }, [selectedLocationId, currentView, tokens, user]);

  const filteredCalls = calls.filter(call => {
    if (dateRange[0] && dateRange[1]) {
      const callDate = new Date(call.createdAt);
      if (callDate < dateRange[0] || callDate > dateRange[1]) {
        return false;
      }
    }
    
    if (selectedAgentId !== 'all' && call.agentId !== selectedAgentId) {
      return false;
    }
    
    return true;
  });

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



  useEffect(() => {
    if (user) {
      // Use user.tutorialCompleted if it exists from the backend, 
      // otherwise fallback to local storage for backward compatibility during transition.
      const localCompleted = localStorage.getItem('tutorialCompleted_' + user?.email);
      if (!user?.tutorialCompleted && !localCompleted) {
        setRunTutorial(true);
      }
    }
  }, [user]);

  const handleTutorialFinish = () => {
    if (user) {
      localStorage.setItem('tutorialCompleted_' + user?.email, 'true');
      setUser({ ...user, tutorialCompleted: true } as any);
      saveTutorialComplete(user?.email || '');
    }
    setRunTutorial(false);
  };

  if (!user) {
    return <LoginView onLoginSuccess={(userData) => {
      setUser(userData);
      setCurrentView('call-logs');
    }} />;
  }

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
          user={user}
          onLogout={() => {
            sessionStorage.removeItem('ghl_user');
            sessionStorage.removeItem('ghl_auth_token');
            setUser(null);
          }}
        />
        
        <div className="p-5 space-y-5 overflow-auto flex-1 relative">
          {currentView === 'settings' ? (
            <SettingsView user={user} onRestartTutorial={() => setRunTutorial(true)} />
          ) : currentView === 'sub-accounts' ? (
            <SubAccountsView 
              locations={locations} 
              selectedLocationId={selectedLocationId}
              tokens={tokens}
              setTokens={setTokens}
              loadingTokens={loadingTokens}
            />
          ) : currentView === 'users' ? (
            <UsersView locations={locations} />
          ) : (
            <>
              {errorMsg ? (
                <div className="flex flex-col items-center justify-center h-[80vh] w-full">
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{t("app.accessError")}</h3>
                    <p className="text-sm text-slate-600 mb-6">
                      {errorMsg}
                    </p>
                    {!isClientMode && (
                      <button 
                        onClick={() => setIsConfigureModalOpen(true)}
                        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Configure API Token
                      </button>
                    )}
                  </div>
                </div>
              ) : loading ? (
                 <div className="flex flex-col items-center justify-center h-[60vh] w-full">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 text-sm font-medium">{t("app.loadingCallLogs")}</p>
                 </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative tour-agent-select">
                        <button 
                          onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                          onBlur={() => setTimeout(() => setIsAgentDropdownOpen(false), 200)}
                          className="bg-white border border-slate-200 text-sm rounded-md px-3 py-1.5 font-medium outline-none focus:border-blue-500 flex items-center justify-between min-w-[140px]"
                        >
                          <span className="truncate">
                            {selectedAgentId === 'all' ? t('app.allAgents') : agents.find(a => a.id === selectedAgentId)?.name || t('app.unknownAgent')}
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
                      <div className="text-xs text-slate-400 font-medium">{t('app.totalRecords', { count: filteredCalls.length })}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard title={t("metrics.attempted")} value={metrics.attempted} />
                    <MetricCard title={t("metrics.connected")} value={metrics.connected} />
                    <MetricCard title={t("metrics.actions")} value={metrics.actionsTriggered} />
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
      {user && (
        <Tutorial 
          run={runTutorial} 
          onFinish={handleTutorialFinish} 
          isClientMode={isClientMode} 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onOpenSampleSummary={() => {
            if (calls.length > 0) {
              setSelectedCall(calls[0]);
            } else {
              setSelectedCall({
                id: 'dummy',
                locationId: 'dummy_location',
                contactId: '+1234567890',
                contactName: 'Demo Contact',
                fromNumber: '+0987654321',
                duration: 120,
                createdAt: new Date().toISOString(),
                agentId: 'agent_dummy',
                agentName: 'Demo Agent',
                summary: 'This is a sample summary for the tutorial.',
                transcript: [
                   { role: 'bot', text: 'Hello, how can I help you today?', timestamp: '00:00' },
                   { role: 'human', text: 'Hi, I need help with my account.', timestamp: '00:05' }
                ],
                extractedData: { intent: 'account_help' },
                status: 'Human Answered',
                trialCall: false,
                workflowName: 'Inbound Support',
                actionsTriggered: 0
              });
            }
          }}
          onCloseSummary={() => setSelectedCall(null)}
        />
      )}

      
      {isConfigureModalOpen && selectedLocationId && locations.find(l => l.id === selectedLocationId) && (
        <ConfigureTokenModal 
          location={locations.find(l => l.id === selectedLocationId)!}
          onClose={() => setIsConfigureModalOpen(false)}
          onSuccess={() => {
            setTokens(prev => ({ ...prev, [selectedLocationId]: 'configured' }));
            setIsConfigureModalOpen(false);
            // Optionally, we could trigger a refresh here, but updating tokens triggers useEffect anyway
          }}
        />
      )}
    </div>
  );
}
