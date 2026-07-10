import { CallLog, Location, TranscriptMessage } from './types';

function parseTranscript(transcriptText: string | null | undefined): TranscriptMessage[] {
  if (!transcriptText) return [];
  const lines = transcriptText.split('\n').filter(l => l.trim().length > 0);
  const messages: TranscriptMessage[] = [];
  
  for (const line of lines) {
    if (line.toLowerCase().startsWith('bot:')) {
      messages.push({ role: 'bot', text: line.substring(4).trim(), timestamp: '' });
    } else if (line.toLowerCase().startsWith('human:')) {
      messages.push({ role: 'human', text: line.substring(6).trim(), timestamp: '' });
    } else {
      if (messages.length > 0) {
        messages[messages.length - 1].text += '\n' + line;
      } else {
        // If there's no bot/human prefix, just add it as a human message or general text
        messages.push({ role: 'bot', text: line.trim(), timestamp: '' });
      }
    }
  }
  return messages;
}

function determineStatus(duration: number): 'Human Answered' | 'Voicemail' | 'No Answer' | 'Failed' {
  if (duration === 0) return 'Failed';
  if (duration > 0 && duration <= 60) return 'Voicemail';
  return 'Human Answered';
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://brayanbb.aiteamtwo.com';
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export function authHeaders() {
  const token = sessionStorage.getItem('ghl_auth_token') || localStorage.getItem('ghl_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  
  // Store token
  sessionStorage.setItem('ghl_auth_token', data.token);
  sessionStorage.setItem('ghl_user', JSON.stringify(data.user));
  
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ oldPassword, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
  return data;
}

export async function fetchLocations(): Promise<{ locations: Location[], warning?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/locations`, { headers: authHeaders() });
    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Not JSON
    }
    
    let locations: Location[] = [];
    if (data.locations && Array.isArray(data.locations)) {
      locations = data.locations.map((loc: any) => ({ id: loc.id, name: loc.name }));
    } else if (data.location) {
      locations = [{ id: data.location.id, name: data.location.name }];
    } else if (data.storedLocations && Array.isArray(data.storedLocations)) {
      locations = data.storedLocations.map((loc: any) => ({ id: loc.locationId || loc.id, name: loc.name || loc.locationId || 'Unknown' }));
    }

    if (!res.ok) {
      return { 
        locations, 
        warning: 'The API has been changed or deleted in GHL. Please update the API to get updated subaccount data.'
      };
    }
    return { locations };
  } catch (error: any) {
    return { locations: [], warning: 'Failed to fetch locations: ' + error.message };
  }
}

export interface Agent {
  id: string;
  name: string;
}

export async function fetchAgents(locationId: string): Promise<Agent[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/agents?locationId=${locationId}`, { headers: authHeaders() });
    const data = await res.json();
    
    if (!res.ok) {
      const errMsg = data.message || data.error || (data.error && data.error.message) || 'Failed to fetch agents';
      throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
    
    if (data.agents && Array.isArray(data.agents)) {
      return data.agents.map((a: any) => ({
        id: a.id,
        name: a.agentName || 'Unknown Agent'
      }));
    }
    return [];
  } catch (err) {
    throw err;
  }
}

export async function fetchCallLogs(locationId: string): Promise<CallLog[]> {
  if (!locationId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/call-logs?locationId=${locationId}`, { headers: authHeaders() });
    const data = await res.json();
    
    if (!res.ok) {
      const errMsg = data.message || data.error || (data.error && data.error.message) || 'Failed to fetch call logs';
      throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
    
    const logs = Array.isArray(data.callLogs) ? data.callLogs : [];
    
    return logs.map((log: any) => ({
      id: log.id || log.messageId,
      locationId: locationId,
      contactId: log.contactId,
      contactName: log.extractedData?.name || 'Unknown',
      fromNumber: log.fromNumber || 'Unknown',
      createdAt: log.createdAt || new Date().toISOString(),
      duration: log.duration || 0,
      agentId: log.agentId || '',
      agentName: 'AI Agent', 
      status: determineStatus(log.duration || 0),
      workflowName: 'Inbound / Outbound',
      callDirection: log.direction || (log.trialCall ? 'Trial' : 'Live'),
      actionsTriggered: log.executedCallActions?.length || 0,
      summary: log.summary || '',
      transcript: parseTranscript(log.transcript),
      extractedData: log.extractedData || {},
      trialCall: !!log.trialCall
    }));
  } catch (error) {
    throw error;
  }
}


export async function saveTutorialComplete(email: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/users/tutorial`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
  } catch (err) {
    console.error('Failed to save tutorial status:', err);
  }
}
