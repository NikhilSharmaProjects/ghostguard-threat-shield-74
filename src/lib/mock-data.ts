
import { Threat, ThreatStats } from './models';

// Generate a random date within the last 7 days
const randomRecentDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 7));
  return date.toISOString();
};

// Sample phishing and malicious URLs
const sampleUrls = [
  'hxxp://security-alert.com/verify-account',
  'hxxp://netflix-account-verify.com/login',
  'hxxp://amaz0n-security.cc/confirm-payment',
  'hxxp://paypal-secure-login.net/auth',
  'hxxp://bank0famerica.info/secure',
  'hxxp://google.com.verifications.info/auth',
  'hxxp://apple-icloud.verify-account.com/login',
  'hxxp://microsoft365-renewal.com/extend',
  'hxxp://facebook-security.verify-login.com/auth',
  'hxxp://dropbox-share.downloadfile.net/document',
  // Some legitimate URLs
  'https://google.com/search',
  'https://microsoft.com/en-us/microsoft-365',
  'https://apple.com/icloud',
  'https://netflix.com/browse',
  'https://amazon.com/deals',
];

// Sample details for threats
const threatDetails = [
  'Contains suspicious login form targeting credentials',
  'Domain registered in the last 24 hours',
  'Redirects to known phishing domain',
  'Uses typosquatted domain name',
  'Contains obfuscated JavaScript',
  'Requests sensitive personal information',
  'Domain has poor reputation score',
  'SSL certificate issues detected',
  'Known malware distribution point',
  'URL contains suspicious parameters',
  'Safe URL with good reputation',
  'Known legitimate domain',
  'Verified secure website',
];

// Generate mock threats
export const generateMockThreats = (count = 20): Threat[] => {
  const threats: Threat[] = [];
  
  for (let i = 0; i < count; i++) {
    // More dangerous threats are less common
    const score = Math.random() * 100;
    let category: Threat['category'] = 'safe';
    
    if (score >= 80) category = 'phishing';
    else if (score >= 60) category = 'malware';
    else if (score >= 40) category = 'scam';
    else if (score >= 20) category = 'suspicious';
    
    // Higher scored threats are more likely to be from email
    const sourceOptions: Threat['source'][] = ['email', 'browser', 'api', 'manual'];
    const sourceIndex = Math.floor(Math.random() * sourceOptions.length);
    
    // Threats with higher scores are more likely to be active
    let status: Threat['status'] = 'mitigated';
    const statusRoll = Math.random();
    if (score > 50 && statusRoll > 0.4) {
      status = 'active';
    } else if (score > 30 && statusRoll > 0.6) {
      status = 'investigating';
    }
    
    // Select a URL - higher index URLs are more likely to be dangerous
    const urlIndex = Math.floor(
      score > 50
        ? Math.random() * 10  // More likely to select first 10 (dangerous) URLs
        : Math.random() * sampleUrls.length // Any URL
    );
    
    // Select relevant details - higher index details are more positive
    const detailsIndex = Math.floor(
      score > 50
        ? Math.random() * 10  // More likely to select first 10 (negative) details
        : 10 + Math.random() * (threatDetails.length - 10) // More positive details
    );
    
    threats.push({
      id: `threat-${i}`,
      url: sampleUrls[urlIndex % sampleUrls.length],
      timestamp: randomRecentDate(),
      score,
      category,
      source: sourceOptions[sourceIndex],
      details: threatDetails[detailsIndex % threatDetails.length],
      status,
    });
  }
  
  return threats;
};

// Calculate threat statistics
export const calculateThreatStats = (threats: Threat[]): ThreatStats => {
  return threats.reduce((stats, threat) => {
    stats.total++;
    
    if (threat.status === 'mitigated') {
      stats.mitigated++;
      return stats;
    }
    
    if (threat.score >= 80) stats.critical++;
    else if (threat.score >= 60) stats.high++;
    else if (threat.score >= 30) stats.medium++;
    else stats.low++;
    
    return stats;
  }, {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    mitigated: 0,
  });
};

// Generate weekly threat data for charts
export const generateWeeklyThreatData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map(day => ({
    name: day,
    phishing: Math.floor(Math.random() * 15) + 5,
    malware: Math.floor(Math.random() * 10) + 2,
    scam: Math.floor(Math.random() * 8) + 1,
    suspicious: Math.floor(Math.random() * 20) + 10,
  }));
};
