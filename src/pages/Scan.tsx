
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertTriangle, Shield, ShieldAlert, ExternalLink } from 'lucide-react';
import ThreatScoreGauge from '@/components/ThreatScoreGauge';
import ThreatBadge from '@/components/ThreatBadge';
import { getThreatLevel } from '@/lib/models';
import ShieldAnimation from '@/components/ShieldAnimation';

const Scan = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<{
    url: string;
    score: number;
    category: string;
    details: string[];
    timestamp: string;
  } | null>(null);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    // Reset scan state when URL changes
    setScanComplete(false);
    setScanResult(null);
  };

  const validateUrl = (url: string) => {
    // Basic URL validation
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    return pattern.test(url);
  };

  const generateMockScanResult = (url: string) => {
    // For demonstration purposes, generate a random threat score
    // In a real app, this would be determined by the AI model
    const isMalicious = url.includes('hxxp') || 
                      /verify|confirm|secure|alert/.test(url.toLowerCase()) ||
                      Math.random() > 0.7;
    
    // Higher score means more dangerous
    let score;
    let category;
    let details = [];
    
    if (isMalicious) {
      score = Math.floor(Math.random() * 40) + 60; // 60-99
      
      if (score > 80) {
        category = 'phishing';
        details = [
          'Domain registered in the last 24 hours',
          'Contains suspicious login form',
          'URL contains deceptive keywords',
          'Mismatched SSL certificate',
          'Domain similar to known brand'
        ];
      } else {
        category = 'suspicious';
        details = [
          'Domain has poor reputation score',
          'URL contains unusual parameters',
          'Redirect chain detected',
          'Similar to known phishing patterns'
        ];
      }
    } else {
      score = Math.floor(Math.random() * 30); // 0-29
      category = 'safe';
      details = [
        'Domain has good reputation',
        'No suspicious elements detected',
        'SSL certificate is valid',
        'No malicious redirects detected'
      ];
    }
    
    return {
      url,
      score,
      category,
      details: details.slice(0, Math.floor(Math.random() * 3) + 2), // Pick 2-4 details
      timestamp: new Date().toISOString(),
    };
  };

  const handleScan = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL format",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanComplete(false);
    setScanResult(null);

    // Simulate API call delay
    setTimeout(() => {
      const result = generateMockScanResult(url);
      setScanResult(result);
      setIsScanning(false);
      setScanComplete(true);
      
      // Show notification based on threat level
      const threatLevel = getThreatLevel(result.score);
      
      if (threatLevel === 'critical' || threatLevel === 'high') {
        toast({
          title: "⚠️ High Threat Detected",
          description: "This URL contains potentially harmful content",
          variant: "destructive",
        });
      } else if (threatLevel === 'medium') {
        toast({
          title: "⚠️ Suspicious URL",
          description: "This URL may not be safe to visit",
          variant: "default",
        });
      } else {
        toast({
          title: "✅ URL is Safe",
          description: "No threats detected in this URL",
        });
      }
    }, 2500);
  };
  
  const threatLevel = scanResult ? getThreatLevel(scanResult.score) : null;
  
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
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">URL Scanner</h1>
        <p className="text-muted-foreground">
          Analyze any URL for phishing, malware, or other security threats
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Scan a URL</CardTitle>
          <CardDescription>
            Enter a website address to analyze it for potential threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={handleUrlChange}
              className="flex-1"
            />
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="bg-ghost-400 hover:bg-ghost-500"
            >
              {isScanning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan URL
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isScanning && (
        <div className="flex flex-col items-center justify-center py-10">
          <ShieldAnimation size="md" />
          <h3 className="mt-6 text-xl font-medium">Analyzing URL</h3>
          <p className="text-muted-foreground mt-2">
            GhostGuard AI is inspecting the URL for potential threats...
          </p>
        </div>
      )}
      
      {scanComplete && scanResult && (
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
            <Button variant="outline" onClick={() => {
              setUrl('');
              setScanComplete(false);
              setScanResult(null);
            }}>
              Scan Another URL
            </Button>
            <Button className="bg-ghost-400 hover:bg-ghost-500">
              Save Report
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Scan;
