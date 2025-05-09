
import { Message, Contact, WhatsAppSession, ConnectionCredentials } from '@/components/WhatsApp/types';

// Base API URL - would point to our Node.js backend
const API_BASE_URL = 'http://localhost:3001/api';

// Store session data in localStorage to persist across page reloads
const SESSION_STORAGE_KEY = 'whatsapp_session';

// Create a WebSocket connection for real-time updates
let socket: WebSocket | null = null;
let messageHandlers: ((message: Message) => void)[] = [];
let connectionStatusHandlers: ((status: WhatsAppSession) => void)[] = [];

// Initialize WebSocket connection
const initializeWebSocket = () => {
  if (socket) return;

  try {
    socket = new WebSocket('ws://localhost:3001');
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      // Restore session if available
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        socket?.send(JSON.stringify({
          type: 'restore_session',
          data: session
        }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message') {
        // Notify all registered message handlers
        messageHandlers.forEach(handler => handler(data.message));
      } else if (data.type === 'connection_status') {
        // Notify all registered connection status handlers
        connectionStatusHandlers.forEach(handler => handler(data.status));
        // Save session data if available
        if (data.status.connected && data.sessionData) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.sessionData));
        }
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      // Try to reconnect after a delay
      setTimeout(() => {
        socket = null;
        initializeWebSocket();
      }, 5000);
    };
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
  }
};

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

// Initialize WhatsApp connection and get QR code
export const initializeWhatsApp = async (): Promise<string> => {
  try {
    initializeWebSocket(); // Ensure WebSocket is connected
    const response = await apiCall('/whatsapp/init', 'POST');
    return response.qrCodeUrl;
  } catch (error) {
    console.error('Failed to initialize WhatsApp:', error);
    throw error;
  }
};

// Register for QR code updates
export const onConnectionStatusChange = (callback: (status: WhatsAppSession) => void) => {
  connectionStatusHandlers.push(callback);
  return () => {
    connectionStatusHandlers = connectionStatusHandlers.filter(h => h !== callback);
  };
};

// Register for new message notifications
export const onNewMessage = (callback: (message: Message) => void) => {
  messageHandlers.push(callback);
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== callback);
  };
};

// Authenticate after QR code scan (simulated in demo mode)
export const completeAuthentication = async (): Promise<WhatsAppSession> => {
  try {
    const response = await apiCall('/whatsapp/authenticate', 'POST');
    return response.session;
  } catch (error) {
    console.error('Failed to complete authentication:', error);
    throw error;
  }
};

// Get all contacts
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const response = await apiCall('/whatsapp/contacts');
    return response.contacts;
  } catch (error) {
    console.error('Failed to get contacts:', error);
    return [];
  }
};

// Get messages for a specific contact
export const getMessages = async (contactId: string): Promise<Message[]> => {
  try {
    const response = await apiCall(`/whatsapp/messages/${contactId}`);
    return response.messages;
  } catch (error) {
    console.error(`Failed to get messages for contact ${contactId}:`, error);
    return [];
  }
};

// Send a message
export const sendMessage = async (contactId: string, text: string): Promise<Message> => {
  try {
    const response = await apiCall('/whatsapp/send', 'POST', {
      contactId,
      text
    });
    return response.message;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// Scan a message for threats
export const scanMessage = async (messageId: string): Promise<{isThreat: boolean, threatScore?: number}> => {
  try {
    const response = await apiCall(`/whatsapp/scan/${messageId}`, 'POST');
    return {
      isThreat: response.isThreat,
      threatScore: response.threatScore
    };
  } catch (error) {
    console.error(`Failed to scan message ${messageId}:`, error);
    throw error;
  }
};

// Scan all unscanned messages
export const scanAllMessages = async (): Promise<{scannedCount: number, threatsFound: number}> => {
  try {
    const response = await apiCall('/whatsapp/scan-all', 'POST');
    return {
      scannedCount: response.scannedCount,
      threatsFound: response.threatsFound
    };
  } catch (error) {
    console.error('Failed to scan all messages:', error);
    throw error;
  }
};

// Disconnect WhatsApp
export const disconnectWhatsApp = async (): Promise<void> => {
  try {
    await apiCall('/whatsapp/disconnect', 'POST');
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (socket) {
      socket.close();
      socket = null;
    }
  } catch (error) {
    console.error('Failed to disconnect WhatsApp:', error);
    throw error;
  }
};

// Helper function to check if the backend is available
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    return response.ok;
  } catch (error) {
    console.error('Backend status check failed:', error);
    return false;
  }
};
