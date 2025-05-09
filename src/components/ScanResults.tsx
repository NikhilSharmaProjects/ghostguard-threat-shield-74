
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import ThreatBadge from '@/components/ThreatBadge';
import ThreatScoreGauge from '@/components/ThreatScoreGauge';
import { getThreatLevel } from '@/lib/models';
import AIInsightsPanel from '@/components/AIInsightsPanel';

interface ScanResultProps {
  scanResult: {
    url: string;
    score: number;
    category: string;
    details: string[];
    timestamp: string;
  };
  aiInsights: {
    threatAnalysis: string;
    securityRecommendations: string[];
    confidenceScore: number;
  } | null;
  aiLoading: boolean;
  onReset: () => void;
  onAiFeedback: (helpful: boolean) => void;
}

const ScanResults: React.FC<ScanResultProps> = ({ 
  scanResult, 
  aiInsights, 
  aiLoading,
  onReset,
  onAiFeedback 
}) => {
  const threatLevel = getThreatLevel(scanResult.score);
  
  // Determine alert styles based on threat level
  const getAlertStyles = () => {
    if (!threatLevel) return {};
    
    switch(threatLevel) {
      case 'critical':
        return {
          variant: 'destructive',
          icon: <ShieldAlert className="h-5 w-5" />,
          title: 'Critical Threat Detected',
          description: 'This URL is highly dangerous and should be avoided.'
        };
      case 'high':
        return {
          variant: 'destructive',
          icon: <ShieldAlert className="h-5 w-5" />,
          title: 'High Threat Detected',
          description: 'This URL is potentially harmful and unsafe to visit.'
        };
      case 'medium':
        return {
          variant: 'default',
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'Medium Risk URL',
          description: 'This URL is suspicious and should be treated with caution.'
        };
      case 'low':
        return {
          variant: 'default',
          icon: <Shield className="h-5 w-5" />,
          title: 'Safe URL',
          description: 'This URL appears to be safe with no detected threats.'
        };
      default:
        return {
          variant: 'default',
          icon: <Shield className="h-5 w-5" />,
          title: 'Scan Complete',
          description: 'URL analysis completed.'
        };
    }
  };
  
  const alertStyles = getAlertStyles();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Analysis completed {new Date(scanResult.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <ThreatBadge score={scanResult.score} size="lg" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alert based on threat level */}
          <Alert variant={alertStyles.variant as any}>
            <div className="flex items-center gap-2">
              {alertStyles.icon}
              <AlertTitle>{alertStyles.title}</AlertTitle>
            </div>
            <AlertDescription>{alertStyles.description}</AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* URL Information */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-medium">Scanned URL</h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="truncate font-mono text-sm bg-secondary px-2 py-1 rounded">
                    {scanResult.url}
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* Detailed Findings */}
              <div>
                <h3 className="text-lg font-medium">Findings</h3>
                <ul className="mt-2 space-y-2">
                  {scanResult.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        threatLevel === 'low' ? 'bg-threat-low' :
                        threatLevel === 'medium' ? 'bg-threat-medium' :
                        threatLevel === 'high' ? 'bg-threat-high' :
                        'bg-threat-critical'
                      }`} />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Threat Score Visualization */}
            <div className="flex flex-col items-center justify-center border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Threat Score</h3>
              <ThreatScoreGauge score={scanResult.score} size="lg" />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {scanResult.score < 30 ? 
                  "This URL appears to be safe." : 
                  scanResult.score < 60 ?
                  "Exercise caution when visiting this URL." :
                  "This URL is potentially dangerous and should be avoided."
                }
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Scan Another URL
          </Button>
          <Button className="bg-ghost-400 hover:bg-ghost-500">
            Save Report
          </Button>
        </CardFooter>
      </Card>
      
      {/* AI Insights Panel */}
      <AIInsightsPanel 
        threatAnalysis={aiInsights?.threatAnalysis || ''}
        securityRecommendations={aiInsights?.securityRecommendations || []}
        isLoading={aiLoading}
        onFeedback={onAiFeedback}
      />
    </div>
  );
};

export default ScanResults;
