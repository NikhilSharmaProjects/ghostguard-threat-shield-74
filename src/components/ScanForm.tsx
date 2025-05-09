
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScanFormProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

const ScanForm: React.FC<ScanFormProps> = ({ onScan, isScanning }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const validateUrl = (url: string) => {
    // Basic URL validation
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    return pattern.test(url);
  };

  const handleSubmit = () => {
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

    onScan(url);
  };

  return (
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
            onClick={handleSubmit} 
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
  );
};

export default ScanForm;
