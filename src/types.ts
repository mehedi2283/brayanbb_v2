export type CallStatus = 'Human Answered' | 'Voicemail' | 'No Answer' | 'Failed' | 'Unattempted';

export interface CallLog {
  id: string;
  locationId: string;
  contactId: string;
  contactName: string;
  fromNumber: string;
  createdAt: string; // ISO date
  duration: number; // in seconds
  agentId: string;
  agentName: string;
  status: CallStatus;
  workflowName: string;
  callDirection?: string;
  actionsTriggered: number;
  summary: string;
  transcript: TranscriptMessage[];
  extractedData: {
    name?: string;
    email?: string;
    address?: string;
    [key: string]: string | undefined;
  };
  trialCall?: boolean;
}

export interface TranscriptMessage {
  role: 'bot' | 'human';
  text: string;
  timestamp: string;
}

export interface Location {
  id: string;
  name: string;
}
