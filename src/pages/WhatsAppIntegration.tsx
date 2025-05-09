
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ShieldCheck, ShieldAlert, Loader2, QrCode, Unlink, RefreshCw } from 'lucide-react';
import ScanningLoader from '@/components/ScanningLoader';
import ThreatBadge from '@/components/ThreatBadge';
import { getThreatLevel } from '@/lib/models';
import { connectWhatsApp, completeWhatsAppAuth, getConnectionStatus, getMessages, WhatsAppMessage, loadMessages, scanAllMessages, disconnectWhatsApp } from '@/lib/whatsapp-service';
import { Link } from 'react-router-dom';

const WhatsAppIntegration = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [showQr, setShowQr] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  
  // Load initial state
  useEffect(() => {
    const status = getConnectionStatus();
    setConnectionStatus(status);
    
    if (status.connected) {
      loadMessages().then(messages => {
        setMessages(messages);
        setActiveTab('messages');
      });
    }
  }, []);
  
  // Handle connection
  const handleConnect = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number to connect",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const status = await connectWhatsApp(phoneNumber);
      setConnectionStatus(status);
      
      if (status.qrCodeUrl) {
        setShowQr(true);
        toast({
          title: "WhatsApp QR Code Ready",
          description: "Scan the QR code with your WhatsApp to connect",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Simulate QR code scan completion
  const handleQrScanComplete = async () => {
    try {
      setIsConnecting(true);
      const status = await completeWhatsAppAuth();
      setConnectionStatus(status);
      setShowQr(false);
      
      if (status.connected) {
        const messages = await loadMessages();
        setMessages(messages);
        setActiveTab('messages');
        
        toast({
          title: "WhatsApp Connected",
          description: "Successfully connected to WhatsApp. Messages are ready for scanning.",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to authenticate WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle disconnect
  const handleDisconnect = () => {
    const status = disconnectWhatsApp();
    setConnectionStatus(status);
    setMessages([]);
    setShowQr(false);
    setActiveTab('setup');
    
    toast({
      title: "WhatsApp Disconnected",
      description: "Your WhatsApp account has been disconnected",
    });
  };
  
  // Handle message refresh
  const handleRefreshMessages = async () => {
    try {
      const messages = await loadMessages();
      setMessages(messages);
      
      toast({
        title: "Messages Refreshed",
        description: `Loaded ${messages.length} messages from WhatsApp`,
      });
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: error instanceof Error ? error.message : "Failed to refresh messages",
        variant: "destructive",
      });
    }
  };
  
  // Handle scan for threats
  const handleScanThreats = async () => {
    try {
      setIsScanning(true);
      
      const threats = await scanAllMessages();
      
      toast({
        title: "Scan Complete",
        description: `Found ${threats.length} potential threats in your WhatsApp messages`,
        variant: threats.length > 0 ? "destructive" : "default",
      });
      
      // Refresh messages to show updated scan status
      const updatedMessages = getMessages();
      setMessages(updatedMessages);
    } catch (error) {
      toast({
        title: "Scan Error",
        description: error instanceof Error ? error.message : "Failed to scan messages",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  if (isScanning) {
    return <ScanningLoader source="whatsapp" />;
  }
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration</h1>
        <p className="text-muted-foreground">
          Connect and scan your WhatsApp messages for malicious links
        </p>
        <div className="mt-4">
          <Button asChild className="bg-ghost-400 hover:bg-ghost-500">
            <Link to="/whatsapp-realtime">
              <MessageSquare className="mr-2 h-4 w-4" />
              Try Real-Time WhatsApp Monitor
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="messages" disabled={!connectionStatus.connected}>Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Connect WhatsApp</CardTitle>
              <CardDescription>
                Link your WhatsApp account to scan messages for security threats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus.connected ? (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-900">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Connected to WhatsApp</h3>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Phone number: {connectionStatus.phoneNumber}<br/>
                        Last sync: {connectionStatus.lastSyncTime?.toLocaleString() || 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {showQr && connectionStatus.qrCodeUrl ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="border p-4 rounded-md bg-white">
                        <img 
                          src={connectionStatus.qrCodeUrl} 
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
                        <Button onClick={handleQrScanComplete}>
                          I've Scanned It
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex mt-1.5">
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your phone number with country code
                        </p>
                      </div>
                      
                      <div className="rounded-md bg-muted p-4">
                        <div className="flex">
                          <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                          <div>
                            <h3 className="font-medium">Security Notice</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              GhostGuard only scans for malicious URLs in your messages and does not 
                              store message content. All scanning is done securely on our servers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              {connectionStatus.connected ? (
                <div className="flex space-x-2">
                  <Button variant="destructive" onClick={handleDisconnect}>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={handleConnect} disabled={isConnecting || !phoneNumber || showQr}>
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
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>WhatsApp Messages</CardTitle>
                  <CardDescription>
                    Scan and monitor your messages for security threats
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleRefreshMessages}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button onClick={handleScanThreats} className="bg-ghost-400 hover:bg-ghost-500">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Scan for Threats
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 rounded-lg border ${
                        message.containsUrl && message.scanned && message.threatId 
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' 
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{message.sender}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="mt-1">{message.text}</p>
                      {message.containsUrl && (
                        <div className="mt-2">
                          {message.scanned ? (
                            message.threatId ? (
                              <div className="flex items-center">
                                <ShieldAlert className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                  Threat detected in this message
                                </span>
                                <div className="ml-auto">
                                  <ThreatBadge score={70} size="sm" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm text-green-600 dark:text-green-400">
                                  No threats detected
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="text-sm text-amber-600 dark:text-amber-400">
                              Contains link - not yet scanned
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No messages found</h3>
                  <p className="text-muted-foreground mt-1">
                    Refresh to load your WhatsApp messages
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppIntegration;
