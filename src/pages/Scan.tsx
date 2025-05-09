
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getThreatLevel } from '@/lib/models';
import { analyzeWithAI } from '@/lib/ai-service';
import ScanForm from '@/components/ScanForm';
import ScanningLoader from '@/components/ScanningLoader';
import ScanResults from '@/components/ScanResults';

const Scan = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    threatAnalysis: string;
    securityRecommendations: string[];
    confidenceScore: number;
  } | null>(null);
  const [scanResult, setScanResult] = useState<{
    url: string;
    score: number;
    category: string;
    details: string[];
    timestamp: string;
  } | null>(null);

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

  const handleScan = async (urlToScan: string) => {
    setUrl(urlToScan);
    setIsScanning(true);
    setScanComplete(false);
    setScanResult(null);
    setAiInsights(null);
    
    // Start AI analysis in parallel with our traditional scan
    setAiLoading(true);
    
    // Simulate API call delay for the basic scan
    setTimeout(() => {
      try {
        const result = generateMockScanResult(urlToScan);
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
        
        // Now try to get AI analysis
        analyzeWithAI({ url: urlToScan })
          .then(aiResult => {
            setAiInsights(aiResult);
            setAiLoading(false);
          })
          .catch(error => {
            console.error("AI analysis failed:", error);
            setAiLoading(false);
            toast({
              title: "AI Analysis Failed",
              description: "Could not get advanced AI insights for this URL",
              variant: "destructive",
            });
          });
      } catch (error) {
        console.error("Error in scan:", error);
        setIsScanning(false);
        toast({
          title: "Scan Failed",
          description: "An error occurred while scanning the URL",
          variant: "destructive",
        });
      }
    }, 2500);
  };
  
  const handleAiFeedback = (helpful: boolean) => {
    toast({
      title: helpful ? "Thanks for your feedback!" : "We'll improve our AI",
      description: helpful 
        ? "Your feedback helps train our AI to be more accurate." 
        : "We've recorded your feedback to improve our analysis.",
    });
  };
  
  const handleReset = () => {
    setUrl('');
    setScanComplete(false);
    setScanResult(null);
    setAiInsights(null);
  };

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">URL Scanner</h1>
        <p className="text-muted-foreground">
          Analyze any URL for phishing, malware, or other security threats
        </p>
      </div>
      
      <ScanForm onScan={handleScan} isScanning={isScanning} />
      
      {isScanning && <ScanningLoader />}
      
      {scanComplete && scanResult && (
        <ScanResults 
          scanResult={scanResult}
          aiInsights={aiInsights}
          aiLoading={aiLoading}
          onReset={handleReset}
          onAiFeedback={handleAiFeedback}
        />
      )}
    </div>
  );
};

export default Scan;
