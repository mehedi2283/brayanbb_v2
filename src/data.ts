import { CallLog, Location, TranscriptMessage } from './types';
import realData from './realData.json';

export const locations: Location[] = [
  { id: 'loc_1', name: 'Tara Solutions' },
  { id: 'loc_2', name: 'Client B' },
  { id: 'loc_3', name: 'Client C' },
];

function parseTranscript(transcriptText: string): TranscriptMessage[] {
  if (!transcriptText) return [];
  const lines = transcriptText.split('\n').filter(l => l.trim().length > 0);
  const messages: TranscriptMessage[] = [];
  
  for (const line of lines) {
    if (line.startsWith('bot:')) {
      messages.push({ role: 'bot', text: line.substring(4).trim(), timestamp: '' });
    } else if (line.startsWith('human:')) {
      messages.push({ role: 'human', text: line.substring(6).trim(), timestamp: '' });
    } else {
      if (messages.length > 0) {
        messages[messages.length - 1].text += '\n' + line;
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

export const mockCalls: CallLog[] = realData.callLogs.map((log: any) => {
  return {
    id: log.id,
    locationId: 'loc_1', // Assign to Tara Solutions
    contactId: log.contactId,
    contactName: log.extractedData?.name || 'Unknown',
    fromNumber: log.fromNumber || 'Unknown',
    createdAt: log.createdAt,
    duration: log.duration,
    agentId: log.agentId,
    agentName: 'Sofia', // Mock agent name as real data doesn't have it
    status: determineStatus(log.duration),
    workflowName: 'Inbound Sales', // Mock workflow
    actionsTriggered: log.executedCallActions?.length || 0,
    summary: log.summary || '',
    transcript: parseTranscript(log.transcript),
    extractedData: log.extractedData || {},
    trialCall: log.trialCall
  };
});

