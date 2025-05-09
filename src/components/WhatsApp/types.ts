
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
  isScanning?: boolean; // Added to fix the TypeScript error
}

export interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastSeen?: Date;
  unreadCount?: number;
}
