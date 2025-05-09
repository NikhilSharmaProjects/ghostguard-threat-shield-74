
import { Threat, getThreatLevel } from '@/lib/models';
import { analyzeWithAI } from '@/lib/ai-service';
import { v4 as uuidv4 } from 'uuid';

export interface EmailConnectionStatus {
  connected: boolean;
  email?: string;
  provider?: string;
  lastSyncTime?: Date;
  error?: string;
}

export interface EmailMessage {
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

// Store for the current connection status and messages
let currentStatus: EmailConnectionStatus = {
  connected: false
};

let cachedEmails: EmailMessage[] = [];
let scannedUrls: Record<string, boolean> = {};

// Extract URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Connect to email
export async function connectEmail(email: string, password: string): Promise<EmailConnectionStatus> {
  try {
    // In a real implementation, this would use OAuth2 or other auth methods
    // For demo purposes, we'll simulate a connection
    
    // Determine provider from email domain
    const domain = email.split('@')[1].toLowerCase();
    let provider = 'unknown';
    
    if (domain.includes('gmail')) provider = 'Gmail';
    else if (domain.includes('outlook') || domain.includes('hotmail')) provider = 'Outlook';
    else if (domain.includes('yahoo')) provider = 'Yahoo';
    else provider = domain;
    
    // Update the current status
    currentStatus = {
      connected: true,
      email: email,
      provider: provider,
      lastSyncTime: new Date()
    };
    
    // Load some sample emails
    await loadEmails();
    
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
export function getConnectionStatus(): EmailConnectionStatus {
  return currentStatus;
}

// Simulate loading emails
export async function loadEmails(): Promise<EmailMessage[]> {
  // Generate some sample emails with URLs
  const sampleSubjects = [
    'Your account security alert',
    'New login attempt',
    'Document shared with you',
    'Payment confirmation',
    'Your order has shipped',
    'Action required: Update your information',
    'Meeting invitation',
    'Your subscription is expiring',
    'Your receipt',
    'Invitation to collaborate'
  ];
  
  const sampleSenders = [
    'security@example.com',
    'noreply@payment-service.com',
    'team@collaboration-app.com',
    'info@newsletter.com',
    'support@cloud-storage.com'
  ];
  
  const sampleUrls = [
    'https://legitimate-bank.com/security',
    'https://malicious-site.net/update-account',
    'https://document-share.com/doc123',
    'https://fake-payment.com/receipt',
    'https://tracking.delivery.com/package'
  ];
  
  // Generate 15 sample emails
  cachedEmails = Array(15).fill(null).map((_, i) => {
    const hasUrl = Math.random() > 0.2; // 80% chance of having a URL
    const urlsCount = hasUrl ? Math.floor(Math.random() * 3) + 1 : 0;
    const urls: string[] = [];
    
    for (let j = 0; j < urlsCount; j++) {
      urls.push(sampleUrls[Math.floor(Math.random() * sampleUrls.length)]);
    }
    
    const subject = sampleSubjects[Math.floor(Math.random() * sampleSubjects.length)];
    const body = hasUrl 
      ? `Hello, please check the following link: ${urls.join(' and also ')}. Thank you.`
      : `This is email ${i + 1} without any links.`;
    
    return {
      id: uuidv4(),
      sender: sampleSenders[Math.floor(Math.random() * sampleSenders.length)],
      subject,
      preview: body.substring(0, 50) + '...',
      body,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)), // Random time in last week
      containsUrl: hasUrl,
      urls,
      scanned: false,
      threatIds: []
    };
  });
  
  // Sort by most recent first
  cachedEmails.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return cachedEmails;
}

// Get all cached emails
export function getEmails(): EmailMessage[] {
  return cachedEmails;
}

// Scan a URL from an email for threats
export async function scanUrl(url: string, emailId: string): Promise<Threat | null> {
  try {
    if (scannedUrls[url]) {
      return null; // Already scanned
    }
    
    // Mark this URL as scanned
    scannedUrls[url] = true;
    
    // Use the existing AI service to analyze the URL
    const analysis = await analyzeWithAI({ url });
    
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
        url,
        timestamp: now.toISOString(),
        score: analysis.confidenceScore,
        category,
        source: 'email',
        details: analysis.threatAnalysis,
        status: 'active'
      };
      
      // Update the email with the threat ID
      const emailIndex = cachedEmails.findIndex(e => e.id === emailId);
      if (emailIndex !== -1) {
        cachedEmails[emailIndex] = {
          ...cachedEmails[emailIndex],
          scanned: true,
          threatIds: [...cachedEmails[emailIndex].threatIds, threatId]
        };
      }
      
      return threat;
    }
    
    return null;
  } catch (error) {
    console.error('Error scanning URL:', error);
    return null;
  }
}

// Scan all URLs in an email
export async function scanEmail(email: EmailMessage): Promise<Threat[]> {
  try {
    const threats: Threat[] = [];
    
    if (!email.containsUrl || email.scanned) {
      return threats;
    }
    
    // Scan each URL in the email
    for (const url of email.urls) {
      const threat = await scanUrl(url, email.id);
      if (threat) {
        threats.push(threat);
      }
    }
    
    // Mark the email as scanned
    const emailIndex = cachedEmails.findIndex(e => e.id === email.id);
    if (emailIndex !== -1) {
      cachedEmails[emailIndex] = {
        ...cachedEmails[emailIndex],
        scanned: true
      };
    }
    
    return threats;
  } catch (error) {
    console.error('Error scanning email:', error);
    return [];
  }
}

// Scan all unscanned emails
export async function scanAllEmails(): Promise<Threat[]> {
  const threats: Threat[] = [];
  
  for (const email of cachedEmails) {
    if (email.containsUrl && !email.scanned) {
      const emailThreats = await scanEmail(email);
      threats.push(...emailThreats);
    }
  }
  
  return threats;
}

// Disconnect email
export function disconnectEmail(): EmailConnectionStatus {
  currentStatus = {
    connected: false
  };
  cachedEmails = [];
  scannedUrls = {};
  
  return currentStatus;
}
