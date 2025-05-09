
import { Threat, getThreatLevel } from '@/lib/models';
import { analyzeWithAI } from '@/lib/ai-service';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would use the WhatsApp API
// For demo purposes, we're simulating the connection with a mock
export interface WhatsAppConnectionStatus {
  connected: boolean;
  qrCodeUrl?: string;
  phoneNumber?: string;
  lastSyncTime?: Date;
  error?: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  containsUrl: boolean;
  url?: string;
  scanned?: boolean;
  threatId?: string;
}

// Store for the current connection status and messages
let currentStatus: WhatsAppConnectionStatus = {
  connected: false
};

let cachedMessages: WhatsAppMessage[] = [];
let scannedUrls: Record<string, boolean> = {};

// Extract URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Connect to WhatsApp
export async function connectWhatsApp(phoneNumber: string): Promise<WhatsAppConnectionStatus> {
  try {
    // In a real implementation, this would initiate the actual WhatsApp Web.js connection
    // For demo purposes, we'll simulate it
    
    // Generate a fake QR code URL for demonstration
    const qrCodeUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAAAklEQVR4AewaftIAAAX3SURBVO3BQY4cy5LAQDKg7n/lOYtZ96MAySz1YxgR/7HWJcNalw1rXTasdcmw1mXDWpcNa102rHXJsNZlw1qXDGtdNqx12bDWJcNalw1rXTKsdcmHl1T+UsWJyknFicpJxYnKScWJyknFicpJxYnKScVfqnhjeOuSYa3LhrUuG9a67MPHVbxJ5U0VJyonFScqJxVvUnlTxSdU3jSsdcmw1mXDWpcNa1324ZdUTipOVN6k8iaVk4oTlZOKE5WTihOVNwxrXTasdcmw1mXDWpd9+LKKv6RyUvGXKk5UTlROKr5pWOuSYa3LhrUuG9a67MOXqfylik+o+KRhrUuGtS4b1rpsWOuyD19W8ZcqTlROKk5UTipOVE4qTlROKk5U3lTxTcNalwxrXTasdcmw1mUfPk7lm1ROKk5UTipOVE4qTlROVE4qTlROKt5U8U3DWpcMa102rHXJsNZlH16q+KaKE5WTihOVk4o3VZyonFScqLxJ5aTiLw1rXTKsdcmw1mXDWpf8xy+onFScVJyovKniROWk4kTlb6o4UTmpOKk4UTmpOFE5qThROak4UTmp+KZhrUuGtS4b1rpsWOuyDy+p/KWKk4oTlZOKk4oTlZOKE5U3qZxUnFScqJxUvKnipOJNw1qXDGtdNqx12bDWZR8+ruJNFScVJxVvqjhROal4k8pJxUnFicpJxYnKScWbhrUuGda6bFjrsmGtyz78kspJxZsqTlROKn5J5aTiROVE5aTiROWk4kTlpOJNw1qXDGtdNqx12bDWZR++rOJE5aTihMpJxZtUTlROKk5U3qRyUvFJw1qXDGtdNqx12bDWZR++TOWk4qTik1ROKk4qTlROVE4qTipOVE5UTipOVE4qPmlY65JhrcuGtS4b1rrsw5dVnFS8SeWk4qTiTRUnKm9SeVPFicpJxUnFNw1rXTKsdcmw1mXDWpd9eEnlpOKk4kTlpOJE5UTlpOJE5aTipeKk4o9UnKicVJxUvDWsdcmw1mXDWpcNa132HxVvUnmTyknFicpJxYnKScVJxUnFicqJyknFScWJyknFNw1rXTKsdcmw1mXDWpd9eKniTRUnKicVJyonFW9SOak4UTmpOFE5qThROVF5U8WbhrUuGda6bFjrsmGtyz68pPKXKk5UTipOVE5UTlROKk5U3qRyUvFJFScVJxXfNKx1ybDWZcNalw1rXfbh4yrepPImlTdVnKicqJxUnKicVLxJ5ZOGtS4Z1rpsWOuyYa3LPvySyknFicpJxYnKScVJxYnKm1ROKk5UPqnipOJE5U3DWpcMa102rHXZsNZlH76s4ptU3lTxJpWTijetvGlY65JhrUuGtS4b1rrswz+m8qbik1ROKk5UTlROKk5UTlROKv5Jw1qXDGtdNqx12bDWZR++rOKbKt6kclJxUvFJKicVb1I5qThROan4pGGtS4a1LhvWumxY67IPL6n8ksqbKt6kclLxJpU3qZxUnFScqJxUfNKw1iXDWpcNa102rHXZf/yCyknFicpJxYnKScWJyknFJw1rXTKsdcmw1mXDWpd9+LiKE5WTihOVk4qTihMqlYoTlZOKE5U3VZxUnFR807DWJcNalw1rXTasdZnKf/yQyicNa302rHXJsNZlw1qXDWtdNqx12bDWJcNalw1rXTasdcmw1mXDWpcMa102rHXJsNZlw1qXDWtd8h8vqZxUnFScVPylik9SOak4qThROak4qXhTxScNa10yrHXZsNZlw1qXfXhJ5S9VnFS8SeWTVE4qTlROVE4qTlROVN5UcVJxUnGiclLxpmGtS4a1LhvWumxY67IPH1fxJpWTihOVk4o3VZyonKicVJyonFScVLxJ5aTipOKbhrUuGda6bFjrsmGtyz78kspJxYnKScWJyknFicpJxYnKScVJxUnFmypOKk4qTlROKt40rHXJsNZlw1qXDWtd9uHLKr6p4kTlpOJE5ZMqTlROKk5U3lRxonJScVLxTcNalwxrXTasdcmw1mUffpnKicqJyknFJ6mcVHxSxZtUTipOVE4q3jSsdcmw1mXDWpcNa1324ctU/lLFicpJxUnFicpJxZtUTipOVE5UTlROKt40rHXJsNZlw1qXDWtd9h8vqZxUnFScVPylik+qOKn4SxUnFScVnzSsdcmw1mXDWpcNa132H2tdMqx12bDWJcNalw1rXTasdcmw1mXDWpcMa102rHXJsNZlw1qXDWtdMqx12bDWJcNal/wfS6IN8AvTLYcAAAAASUVORK5CYII=';
    
    // Update the current status
    currentStatus = {
      connected: false,
      qrCodeUrl: qrCodeUrl,
      phoneNumber: phoneNumber
    };
    
    return currentStatus;
  } catch (error) {
    currentStatus = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    return currentStatus;
  }
}

// Simulate WhatsApp authentication completion (after QR code scan)
export async function completeWhatsAppAuth(): Promise<WhatsAppConnectionStatus> {
  try {
    // Simulate successful connection
    currentStatus = {
      connected: true,
      phoneNumber: currentStatus.phoneNumber,
      lastSyncTime: new Date()
    };
    
    // Simulate some initial messages
    await loadMessages();
    
    return currentStatus;
  } catch (error) {
    currentStatus = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    return currentStatus;
  }
}

// Get the current connection status
export function getConnectionStatus(): WhatsAppConnectionStatus {
  return currentStatus;
}

// Simulate loading messages
export async function loadMessages(): Promise<WhatsAppMessage[]> {
  // For demo purposes, generate some sample messages with URLs
  const sampleUrls = [
    'https://example.com/safe-site',
    'https://malware-test.com/dangerous',
    'https://phishing.example.net/login',
    'https://good-site.org/welcome',
    'https://virus.test/download'
  ];
  
  const sampleSenders = [
    'Alice',
    'Bob',
    'Work Group',
    'Family Group',
    'Unknown'
  ];
  
  // Generate 10 sample messages
  cachedMessages = Array(10).fill(null).map((_, i) => {
    const hasUrl = Math.random() > 0.4;
    const randomUrl = hasUrl ? sampleUrls[Math.floor(Math.random() * sampleUrls.length)] : undefined;
    return {
      id: uuidv4(),
      sender: sampleSenders[Math.floor(Math.random() * sampleSenders.length)],
      text: hasUrl 
        ? `Check out this link: ${randomUrl}` 
        : `Message ${i + 1} without any link`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)), // Random time in last 24h
      containsUrl: hasUrl,
      url: randomUrl,
      scanned: false
    };
  });
  
  // Sort by most recent first
  cachedMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return cachedMessages;
}

// Get all cached messages
export function getMessages(): WhatsAppMessage[] {
  return cachedMessages;
}

// Scan a message for threats
export async function scanMessage(message: WhatsAppMessage): Promise<Threat | null> {
  try {
    if (!message.containsUrl || !message.url || scannedUrls[message.url]) {
      return null;
    }
    
    // Mark this URL as scanned to avoid duplicates
    scannedUrls[message.url] = true;
    
    // Use the existing AI service to analyze the URL
    const analysis = await analyzeWithAI({ url: message.url });
    
    // Create a threat entry if the confidence score is high enough
    if (analysis.confidenceScore > 30) {
      const threatId = uuidv4();
      const now = new Date();
      
      // Determine the category based on the analysis
      let category: 'phishing' | 'malware' | 'scam' | 'suspicious' | 'safe' = 'suspicious';
      if (analysis.confidenceScore > 80) {
        category = analysis.threatAnalysis.toLowerCase().includes('phish') ? 'phishing' : 'malware';
      } else if (analysis.confidenceScore > 60) {
        category = 'scam';
      } else if (analysis.confidenceScore < 30) {
        category = 'safe';
      }
      
      // Create a new threat entry
      const threat: Threat = {
        id: threatId,
        url: message.url,
        timestamp: now.toISOString(),
        score: analysis.confidenceScore,
        category,
        source: 'whatsapp',
        details: analysis.threatAnalysis,
        status: 'active'
      };
      
      // Update the message with the threat ID
      const messageIndex = cachedMessages.findIndex(m => m.id === message.id);
      if (messageIndex !== -1) {
        cachedMessages[messageIndex] = {
          ...cachedMessages[messageIndex],
          scanned: true,
          threatId
        };
      }
      
      return threat;
    }
    
    return null;
  } catch (error) {
    console.error('Error scanning message:', error);
    return null;
  }
}

// Scan all unscanned messages
export async function scanAllMessages(): Promise<Threat[]> {
  const threats: Threat[] = [];
  
  for (const message of cachedMessages) {
    if (message.containsUrl && !message.scanned) {
      const threat = await scanMessage(message);
      if (threat) {
        threats.push(threat);
      }
    }
  }
  
  return threats;
}

// Disconnect WhatsApp
export function disconnectWhatsApp(): WhatsAppConnectionStatus {
  currentStatus = {
    connected: false
  };
  cachedMessages = [];
  scannedUrls = {};
  
  return currentStatus;
}
