
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
}

export interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastSeen?: Date;
  unreadCount?: number;
  isAllowed?: boolean;
}

export interface WhatsAppSession {
  connected: boolean;
  qrCodeUrl?: string;
  clientId?: string;
  lastActive?: Date;
}

export interface ScanStatus {
  inProgress: boolean;
  messageId?: string;
}

export interface ConnectionCredentials {
  clientId?: string;
  sessionData?: string;
}
