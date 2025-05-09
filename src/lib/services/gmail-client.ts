
import { extractUrls } from '@/lib/unified-scan-service';

interface EmailCredentials {
  email: string;
  password: string;
}

interface EmailConnectionStatus {
  connected: boolean;
  email?: string;
  provider?: string;
  lastSyncTime?: Date;
  error?: string;
}

interface EmailMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  containsUrl: boolean;
  urls: string[];
  scanned: boolean;
  threatIds: string[];
}

// Base API URL - would point to our Node.js backend
const API_BASE_URL = 'http://localhost:3001/api';

// Store session data in localStorage to persist across page reloads
const EMAIL_SESSION_KEY = 'email_session';
let connectionStatusHandlers: ((status: EmailConnectionStatus) => void)[] = [];
let newEmailHandlers: ((email: EmailMessage) => void)[] = [];

// Utility function for API calls
const apiCall = async (endpoint: string, method = 'GET', data?: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    throw error;
  }
};

// Connect to email
export const connectEmail = async (credentials: EmailCredentials): Promise<EmailConnectionStatus> => {
  try {
    const response = await apiCall('/email/connect', 'POST', credentials);
    
    if (response.connected) {
      // Save connection info (NOT credentials) to localStorage
      localStorage.setItem(EMAIL_SESSION_KEY, JSON.stringify({
        email: credentials.email,
        connected: true,
        provider: response.provider,
        lastSyncTime: response.lastSyncTime
      }));
      
      // Notify any registered handlers
      connectionStatusHandlers.forEach(handler => 
        handler({
          connected: true,
          email: credentials.email,
          provider: response.provider,
          lastSyncTime: new Date(response.lastSyncTime)
        })
      );
    }
    
    return {
      connected: response.connected,
      email: credentials.email,
      provider: response.provider,
      lastSyncTime: new Date(response.lastSyncTime),
      error: response.error
    };
  } catch (error) {
    console.error('Failed to connect email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      error: errorMessage
    };
  }
};

// Check current connection status
export const getConnectionStatus = (): EmailConnectionStatus => {
  const saved = localStorage.getItem(EMAIL_SESSION_KEY);
  if (!saved) {
    return { connected: false };
  }
  
  try {
    const session = JSON.parse(saved);
    return {
      ...session,
      lastSyncTime: session.lastSyncTime ? new Date(session.lastSyncTime) : undefined
    };
  } catch {
    return { connected: false };
  }
};

// Register for connection status updates
export const onConnectionStatusChange = (callback: (status: EmailConnectionStatus) => void) => {
  connectionStatusHandlers.push(callback);
  return () => {
    connectionStatusHandlers = connectionStatusHandlers.filter(h => h !== callback);
  };
};

// Register for new email notifications
export const onNewEmail = (callback: (email: EmailMessage) => void) => {
  newEmailHandlers.push(callback);
  return () => {
    newEmailHandlers = newEmailHandlers.filter(h => h !== callback);
  };
};

// Load emails
export const loadEmails = async (): Promise<EmailMessage[]> => {
  try {
    const response = await apiCall('/email/messages');
    return response.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load emails:', error);
    return [];
  }
};

// Get all cached emails
export const getEmails = async (): Promise<EmailMessage[]> => {
  return loadEmails(); // For now, just reload from server
};

// Scan a URL from an email for threats
export const scanUrl = async (url: string, emailId: string): Promise<any> => {
  try {
    const response = await apiCall('/email/scan-url', 'POST', { url, emailId });
    return response.threat;
  } catch (error) {
    console.error('Error scanning URL:', error);
    return null;
  }
};

// Scan all URLs in an email
export const scanEmail = async (emailId: string): Promise<any[]> => {
  try {
    const response = await apiCall(`/email/scan/${emailId}`, 'POST');
    return response.threats || [];
  } catch (error) {
    console.error('Error scanning email:', error);
    return [];
  }
};

// Scan all unscanned emails
export const scanAllEmails = async (): Promise<any[]> => {
  try {
    const response = await apiCall('/email/scan-all', 'POST');
    return response.threats || [];
  } catch (error) {
    console.error('Error scanning all emails:', error);
    return [];
  }
};

// Disconnect email
export const disconnectEmail = async (): Promise<EmailConnectionStatus> => {
  try {
    await apiCall('/email/disconnect', 'POST');
    localStorage.removeItem(EMAIL_SESSION_KEY);
    
    const status = { connected: false };
    connectionStatusHandlers.forEach(handler => handler(status));
    return status;
  } catch (error) {
    console.error('Error disconnecting email:', error);
    return { connected: false, error: 'Disconnect failed' };
  }
};
