
import { analyzeWithAI } from '@/lib/ai-service';
import { v4 as uuidv4 } from 'uuid';
import { Threat } from '@/lib/models';

// Unified interface that works for both WhatsApp and Email
export interface ScanResult {
  id: string;
  url: string;
  isThreateningScan: boolean;
  threatScore: number;
  threatAnalysis?: string;
  securityRecommendations?: string[];
  timestamp: Date;
}

// Detection function for URLs in text content
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Known malicious domains blocklist
const maliciousDomains: string[] = [
  "malicious-site.com",
  "phishing-domain.net",
  "scam-link.org",
  "malware-test.com",
  "phishing.example.net",
];

// Suspicious TLDs list
const suspiciousTLDs: string[] = [".xyz", ".top", ".info", ".click"];

// URL shortening services that need expansion/verification
const urlShorteners: string[] = ["bit.ly", "t.co", "tinyurl.com", "goo.gl", "tiny.cc"];

// Quick check for obviously malicious URLs based on patterns
export function quickMaliciousCheck(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check against blocklist
    if (maliciousDomains.some(domain => hostname.includes(domain))) {
      return true;
    }

    // Check for suspicious TLDs
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      return true;
    }

    // Check for URL shorteners (often used to mask malicious URLs)
    if (urlShorteners.includes(hostname)) {
      return true; // Treat as potentially suspicious for further analysis
    }

    return false;
  } catch (err) {
    console.error("Error parsing URL:", err);
    return true; // Treat invalid URLs as suspicious
  }
}

// Unified scan function for either WhatsApp or Email content
export async function scanContentForThreats(
  content: string, 
  source: 'whatsapp' | 'email' | 'manual' | 'browser' | 'api',
  itemId: string
): Promise<Threat | null> {
  try {
    // Extract URLs from content
    const urls = extractUrls(content);
    if (urls.length === 0) {
      return null; // No URLs to scan
    }

    // For each URL in the content, perform analysis
    for (const url of urls) {
      // Quick check first
      const isQuickSuspicious = quickMaliciousCheck(url);
      
      // If quick check flags it or we want to analyze all URLs
      if (isQuickSuspicious || true) { // Always scan for now, can optimize later
        // Use the AI service for deep analysis
        const analysis = await analyzeWithAI({ url });
        
        // Create a threat entry if the confidence score is high enough
        if (analysis.confidenceScore > 30) {
          const threatId = uuidv4();
          const now = new Date();
          
          // Determine the category based on the analysis
          let category: 'phishing' | 'malware' | 'scam' | 'suspicious' | 'safe' = 'suspicious';
          
          if (analysis.confidenceScore > 80) {
            category = analysis.threatAnalysis.toLowerCase().includes('phish') 
              ? 'phishing' 
              : 'malware';
          } else if (analysis.confidenceScore > 60) {
            category = 'scam';
          } else if (analysis.confidenceScore < 30) {
            category = 'safe';
          }
          
          // Create and return threat
          const threat: Threat = {
            id: threatId,
            url,
            timestamp: now.toISOString(),
            score: analysis.confidenceScore,
            category,
            source,
            details: analysis.threatAnalysis,
            status: 'active'
          };
          
          return threat;
        }
      }
    }
    
    return null; // No threats found
  } catch (error) {
    console.error('Error scanning content:', error);
    return null;
  }
}
