
export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
  containsUrl: boolean;
  urls?: string[];
  scanned?: boolean;
  isThreat?: boolean;
  threatScore?: number;
  isScanning?: boolean;
  threadId?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastSeen?: Date;
  unreadCount?: number;
  isAllowed?: boolean;
  profilePicUrl?: string;
  isGroup?: boolean;
  groupParticipants?: number;
}

export interface WhatsAppSession {
  connected: boolean;
  qrCodeUrl?: string;
  clientId?: string;
  lastActive?: Date;
  phoneNumber?: string;
  status?: 'connecting' | 'authenticated' | 'disconnected';
}

export interface ScanStatus {
  inProgress: boolean;
  messageId?: string;
}

export interface ConnectionCredentials {
  clientId?: string;
  sessionData?: string;
}

export interface MessageAttachment {
  type: 'image' | 'video' | 'audio' | 'document';
  url?: string;
  filename?: string;
  mimeType?: string;
}
