
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, ShieldCheck, ShieldAlert, Loader2, Unlink, RefreshCw } from 'lucide-react';
import ScanningLoader from '@/components/ScanningLoader';
import ThreatBadge from '@/components/ThreatBadge';
import { getThreatLevel } from '@/lib/models';
import { connectEmail, getConnectionStatus, getEmails, EmailMessage, loadEmails, scanAllEmails, disconnectEmail } from '@/lib/email-service';

const EmailIntegration = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [activeTab, setActiveTab] = useState('setup');
  
  // Load initial state
  useEffect(() => {
    const status = getConnectionStatus();
    setConnectionStatus(status);
    
    if (status.connected) {
      loadEmails().then(emails => {
        setEmails(emails);
        setActiveTab('emails');
      });
    }
  }, []);
  
  // Handle connection
  const handleConnect = async () => {
    if (!email || !email.includes('@') || !password) {
      toast({
        title: "Invalid Credentials",
        description: "Please enter a valid email address and password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const status = await connectEmail(email, password);
      setConnectionStatus(status);
      
      if (status.connected) {
        const emails = await loadEmails();
        setEmails(emails);
        setActiveTab('emails');
        
        toast({
          title: "Email Connected",
          description: `Successfully connected to ${status.provider}. Emails are ready for scanning.`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to email",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle disconnect
  const handleDisconnect = () => {
    const status = disconnectEmail();
    setConnectionStatus(status);
    setEmails([]);
    setActiveTab('setup');
    
    toast({
      title: "Email Disconnected",
      description: "Your email account has been disconnected",
    });
  };
  
  // Handle email refresh
  const handleRefreshEmails = async () => {
    try {
      const emails = await loadEmails();
      setEmails(emails);
      
      toast({
        title: "Emails Refreshed",
        description: `Loaded ${emails.length} emails from your account`,
      });
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: error instanceof Error ? error.message : "Failed to refresh emails",
        variant: "destructive",
      });
    }
  };
  
  // Handle scan for threats
  const handleScanThreats = async () => {
    try {
      setIsScanning(true);
      
      const threats = await scanAllEmails();
      
      toast({
        title: "Scan Complete",
        description: `Found ${threats.length} potential threats in your emails`,
        variant: threats.length > 0 ? "destructive" : "default",
      });
      
      // Refresh emails to show updated scan status
      const updatedEmails = getEmails();
      setEmails(updatedEmails);
    } catch (error) {
      toast({
        title: "Scan Error",
        description: error instanceof Error ? error.message : "Failed to scan emails",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  if (isScanning) {
    return <ScanningLoader source="email" />;
  }
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Integration</h1>
        <p className="text-muted-foreground">
          Connect and scan your emails for malicious links
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="emails" disabled={!connectionStatus.connected}>Emails</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Connect Email Account</CardTitle>
              <CardDescription>
                Link your email account to scan messages for security threats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus.connected ? (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-900">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                        Connected to {connectionStatus.provider}
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Email: {connectionStatus.email}<br/>
                        Last sync: {connectionStatus.lastSyncTime?.toLocaleString() || 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex mt-1.5">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password or App Password</Label>
                    <div className="flex mt-1.5">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      For Gmail or other providers that use 2FA, you may need to create an app password
                    </p>
                  </div>
                  
                  <div className="rounded-md bg-muted p-4">
                    <div className="flex">
                      <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="font-medium">Security Notice</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          GhostGuard only scans for malicious URLs in your emails and does not 
                          store email content. All scanning is done securely on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
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
                <Button onClick={handleConnect} disabled={isConnecting || !email || !password}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Connect Email
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Email Messages</CardTitle>
                  <CardDescription>
                    Scan and monitor your emails for security threats
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleRefreshEmails}>
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
              {emails.length > 0 ? (
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div 
                      key={email.id} 
                      className={`p-4 rounded-lg border ${
                        email.containsUrl && email.scanned && email.threatIds.length > 0
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' 
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{email.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(email.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        From: {email.sender}
                      </div>
                      <p className="mt-2 text-sm">{email.preview}</p>
                      {email.containsUrl && (
                        <div className="mt-2">
                          {email.scanned ? (
                            email.threatIds.length > 0 ? (
                              <div className="flex items-center">
                                <ShieldAlert className="h-4 w-4 text-red-500 mr-2" />
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                  {email.threatIds.length} threat{email.threatIds.length > 1 ? 's' : ''} detected
                                </span>
                                <div className="ml-auto">
                                  <ThreatBadge score={80} size="sm" />
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
                              Contains {email.urls.length} link{email.urls.length > 1 ? 's' : ''} - not yet scanned
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No emails found</h3>
                  <p className="text-muted-foreground mt-1">
                    Refresh to load your email messages
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

export default EmailIntegration;
