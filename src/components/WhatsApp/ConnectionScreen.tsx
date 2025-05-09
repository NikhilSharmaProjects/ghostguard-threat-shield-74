
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2, QrCode } from 'lucide-react';

interface ConnectionScreenProps {
  isConnecting: boolean;
  showQr: boolean;
  qrCodeUrl: string;
  handleConnect: () => void;
  handleQrScanComplete: () => void;
  setShowQr: (show: boolean) => void;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({
  isConnecting,
  showQr,
  qrCodeUrl,
  handleConnect,
  handleQrScanComplete,
  setShowQr
}) => {
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Realtime Monitoring</h1>
        <p className="text-muted-foreground">
          Connect your WhatsApp to monitor messages in real-time and scan for threats
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Connect WhatsApp</CardTitle>
          <CardDescription>
            Link your WhatsApp to scan messages for security threats in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showQr && qrCodeUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="border p-4 rounded-md bg-white">
                <img 
                  src={qrCodeUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 object-contain"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                1. Open WhatsApp on your phone<br/>
                2. Go to Settings &gt; Linked Devices<br/>
                3. Tap "Link a Device" and scan this QR code
              </p>
              <div className="flex space-x-2">
                <Button onClick={() => setShowQr(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleQrScanComplete} className="bg-ghost-400 hover:bg-ghost-500">
                  I've Scanned It
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md bg-muted p-4">
                <div className="flex">
                  <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Real-time Protection</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect your WhatsApp to automatically scan all incoming messages with URLs.
                      GhostGuard will protect you from phishing and malware links in real-time.
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertTitle>Privacy Notice</AlertTitle>
                <AlertDescription>
                  GhostGuard only scans URLs in your messages and never stores your message content.
                  All scanning is done securely on your device.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
        <CardFooter>
          {!showQr && (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="bg-ghost-400 hover:bg-ghost-500"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Connect WhatsApp
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConnectionScreen;
