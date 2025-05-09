
export interface Threat {
  id: string;
  url: string;
  timestamp: string;
  score: number;
  category: 'phishing' | 'malware' | 'scam' | 'suspicious' | 'safe';
  source: 'email' | 'browser' | 'api' | 'manual';
  details: string;
  status: 'active' | 'mitigated' | 'investigating';
}

export interface ThreatStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  mitigated: number;
}

export const getThreatLevel = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export const getThreatColor = (level: 'critical' | 'high' | 'medium' | 'low'): string => {
  const colors = {
    critical: 'text-threat-critical bg-threat-critical/10 border-threat-critical/20',
    high: 'text-threat-high bg-threat-high/10 border-threat-high/20',
    medium: 'text-threat-medium bg-threat-medium/10 border-threat-medium/20',
    low: 'text-threat-low bg-threat-low/10 border-threat-low/20'
  };

  return colors[level] || colors.low;
}

