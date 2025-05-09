import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Unlink } from 'lucide-react';
import { Message, Contact } from '@/components/WhatsApp/types';
import ConnectionScreen from '@/components/WhatsApp/ConnectionScreen';
import ContactsList from '@/components/WhatsApp/ContactsList';
import ChatWindow from '@/components/WhatsApp/ChatWindow';
import SettingsTab from '@/components/WhatsApp/SettingsTab';

const WhatsAppRealtime = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [allowedContacts, setAllowedContacts] = useState<string[]>([]);
  const [newAllowedContact, setNewAllowedContact] = useState('');
  
  // Simulated initialization
  useEffect(() => {
    // Check local storage for connection status (for demo)
    const savedConnected = localStorage.getItem('whatsapp_connected') === 'true';
    if (savedConnected) {
      setIsConnected(true);
      loadSampleContacts();
    }
  }, []);
  
  // When a contact is selected, load their messages
  useEffect(() => {
    if (selectedContact) {
      loadSampleMessages(selectedContact.id);
    }
  }, [selectedContact]);
  
  // Simulated contact loading
  const loadSampleContacts = () => {
    const sampleContacts: Contact[] = [
      { id: '1', name: 'Alice', lastMessage: 'Hey, check this link', lastSeen: new Date(), unreadCount: 2 },
      { id: '2', name: 'Bob', lastMessage: 'Meeting tomorrow?', lastSeen: new Date(Date.now() - 3600000), unreadCount: 0 },
      { id: '3', name: 'Work Group', lastMessage: 'Document shared', lastSeen: new Date(), unreadCount: 5 },
      { id: '4', name: 'Family Group', lastMessage: 'Dinner plans', lastSeen: new Date(Date.now() - 7200000), unreadCount: 1 },
      { id: '5', name: 'Support Team', lastMessage: 'We fixed your issue', lastSeen: new Date(Date.now() - 86400000), unreadCount: 0 },
    ];
    
    setContacts(sampleContacts);
    // Set first contact as selected by default
    setSelectedContact(sampleContacts[0]);
    
    // Load allowed contacts from storage or set defaults
    const savedAllowedContacts = localStorage.getItem('allowed_contacts');
    if (savedAllowedContacts) {
      setAllowedContacts(JSON.parse(savedAllowedContacts));
    } else {
      const defaultAllowed = ['Alice', 'Work Group', 'Family Group'];
      setAllowedContacts(defaultAllowed);
      localStorage.setItem('allowed_contacts', JSON.stringify(defaultAllowed));
    }
  };
  
  // Simulated message loading
  const loadSampleMessages = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    const sampleMessages: Message[] = [];
    
    // Add 10-15 sample messages
    const messageCount = Math.floor(Math.random() * 6) + 10;
    for (let i = 0; i < messageCount; i++) {
      // Determine if this message contains URLs (30% chance)
      const hasUrl = Math.random() < 0.3;
      let urls: string[] = [];
      let messageText = '';
      
      if (hasUrl) {
        const url = Math.random() < 0.5 
          ? 'https://example.com/legitimate-file.pdf' 
          : 'https://suspicious-site.net/login-verify';
        urls = [url];
        messageText = `Hey, check out this link: ${url}`;
      } else {
        const templates = [
          "How are you doing?",
          "Can we meet tomorrow?",
          "Did you see the news?",
          "Thanks for your help!",
          "I'll get back to you soon",
          "Let's catch up later",
          "Are you available now?",
          "That sounds good to me",
          "I'm running late, sorry!",
          "What do you think about this?"
        ];
        messageText = templates[Math.floor(Math.random() * templates.length)];
      }
      
      // Add message, alternating between sent and received
      sampleMessages.push({
        id: `msg-${i}`,
        sender: i % 2 === 0 ? contact.name : 'Me',
        text: messageText,
        timestamp: new Date(Date.now() - (messageCount - i) * 300000), // Spaced out by 5 minutes
        isMine: i % 2 === 1,
        containsUrl: hasUrl,
        urls: hasUrl ? urls : undefined,
        scanned: hasUrl && Math.random() < 0.7, // 70% of URL messages have been scanned
        isThreat: hasUrl && Math.random() < 0.3, // 30% of URLs are threats
        threatScore: Math.floor(Math.random() * 100)
      });
    }
    
    // Sort by timestamp
    sampleMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    setMessages(sampleMessages);
    
    // Clear unread count for this contact
    setContacts(contacts.map(c => 
      c.id === contactId ? {...c, unreadCount: 0} : c
    ));
  };
  
  // Simulated connection
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // In a real implementation, this would call the WhatsApp Web.js API
      // For demo purposes, we'll simulate with a timeout
      setTimeout(() => {
        // Generate QR code (in a real app, this would be from WhatsApp Web.js)
        const demoQrUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAAAklEQVR4AewaftIAAAX3SURBVO3BQY4cy5LAQDKg7n/lOYtZ96MAySz1YxgR/7HWJcNalw1rXTasdcmw1mXDWpcNa102rHXJsNZlw1qXDGtdNqx12bDWJcNalw1rXTKsdcmHl1T+UsWJyknFicpJxYnKScVJxYnKScVfqnhjeOuSYa3LhrUuG9a67MPHVbxJ5U0VJyonFScqJxVvUnlTxSdU3jSsdcmw1mXDWpcNa1324ZdUTipOVN6k8iaVk4oTlZOKE5WTihOVNwxrXTasdcmw1mXDWpd9+LKKv6RyUvGXKk5UTlROKr5pWOuSYa3LhrUuG9a67MOXqfylik+o+KRhrUuGtS4b1rpsWOuyD19W8ZcqTlROKk5UTipOVE5UThROVE4qTlROKt5U8U3DWpcMa102rHXJsNZlH45U3lTxJpWTipeGtd41rHXJsNZlw1qXffg4lW+qOKk4UTmpOFE5qfikijepmA1rXTKsdcmw1mXDWpcMa1324aWKb6o4UTmpOFE5qXhTxYnKScVJxUnFScWbKr5pWOuSYa3LhrUuG9a67MPHqZxUfFPFicpJxYnKScVJxUnFScVJxYnKScVJxYnKNw1rXTKsdcmw1mXDWpf8xy+onFScVJyovKniROWk4kTlb6o4UTmpOKk4UTmpOFE5qThROak4UTmp+KZhrUuGtS4b1rpsWOuyDy+p/KWKk4oTlZOKk4oTlZOKE5U3qZxUnFScqJxUvKnipOJNw1qXDGtdNqx12bDWZR8+ruJNFScVJxVvqjhROal4k8pJxUnFicpJxYnKScWbhrUuGda6bFjrsmGtyz78kspJxZsqTlROKn5J5aTiROVE5aTiROWk4kTlpOJNw1qXDGtdNqx12bDWZR++rOJE5aTihMpJxZtUTipOKk5U3qRyUvFJw1qXDGtdNqx12bDWZR++TOWk4qTik1ROKk4qTlROVE4qTipOVE5UTipOVE4qPmlY65JhrcuGtS4b1rrsw5dVnFS8SeWk4qTiTRUnKm9SeVPFicpJxUnFNw1rXTKsdcmw1mXDWpd9eEnlpOKk4kTlpOJE5UTlpOJE5aTipeKk4o9UnKicVJxUvDWsdcmw1mXDWpcNa132HxVvUnmTyknFicpJxYnKScVJxUnFicqJyknFScWJyknFNw1rXTKsdcmw1mXDWpd9eKniTRUnKicVJyonFW9SOak4UTmpOFE5qThROVF5U8WbhrUuGda6bFjrsmGtyz68pPKXKk5UTipOVE5UTlROKk5U3qRyUvFJFScVJxXfNKx1ybDWZcNalw1rXfbh4yrepPImlTdVnKicqJxUnKicVLxJ5ZOGtS4Z1rpsWOuyYa3LPvySyknFicpJxYnKScVJxYnKm1ROKk5UPqnipOJE5U3DWpcMa102rHXZsNZlH76s4ptU3lTxJpWTijetvGlY65JhrUuGtS4b1rrswz+m8qbik1ROKk5UTlROKk5UTlROKv5Jw1qXDGtdNqx12bDWZR++rOKbKt6kclJxUvFJKicVb1I5qThROan4pGGtS4a1LhvWumxY67IPL6n8ksqbKt6kclLxJpU3qZxUnFScqJxUfNKw1iXDWpcNa102rHXZf/yCyknFicpJxYnKScWJyknFJw1rXTKsdcmw1mXDWpd9+LiKE5WTihOVk4qTihMqlYoTlZOKE5U3VZxUnFR807DWJcNalw1rXTasdZnKf/yQyicNa302rHXJsNZlw1qXDWtdNqx12bDWJcNalw1rXTasdcmw1mXDWpcMa102rHXJsNZlw1qXDWtd8h8vqZxUnFScVPylik9SOak4qThROak4qXhTxScNa10yrHXZsNZlw1qXfXhJ5S9VnFS8SeWTVE4qTlROVE4qTlROVN5UcVJxUnGiclLxpmGtS4a1LhvWumxY67IPH1fxJpWTihOVk4o3VZyonKicVJyonFScVLxJ5aTipOKbhrUuGda6bFjrsmGtyz78kspJxYnKScWJyknFicpJxYnKScVJxUnFmypOKk4qTlROKt40rHXJsNZlw1qXDWtd9uHLKr6p4kTlpOJE5ZMqTlROKk5U3lRxonJScVLxTcNalwxrXTasdcmw1mUffpnKicqJyknFJ6mcVHxSxZtUTipOVE4q3jSsdcmw1mXDWpcNa1324ctU/lLFicpJxUnFicpJxZtUTipOVE5UTlROKt40rHXJsNZlw1qXDWtd9h8vqZxUnFScVPylik+qOKn4SxUnFScVnzSsdcmw1mXDWpcNa132H2tdMqx12bDWJcNalw1rXTasdcmw1mXDWpcMa102rHXJsNZlw1qXDWtdMqx12bDWJcNal/wfS6IN8AvTLYcAAAAASUVORK5CYII=';
        
        setQrCodeUrl(demoQrUrl);
        setShowQr(true);
        
        toast({
          title: "WhatsApp QR Code Ready",
          description: "Scan this QR code with your WhatsApp to connect",
        });
        
        setIsConnecting(false);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to WhatsApp",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };
  
  // Simulated QR code scan completion
  const handleQrScanComplete = () => {
    setShowQr(false);
    setIsConnected(true);
    localStorage.setItem('whatsapp_connected', 'true');
    
    toast({
      title: "WhatsApp Connected",
      description: "Successfully connected to WhatsApp. You can now monitor messages in real-time.",
    });
    
    // Load sample contacts and messages
    loadSampleContacts();
  };
  
  // Add a contact to the allowed list
  const handleAddAllowedContact = () => {
    if (newAllowedContact.trim() === '') return;
    
    if (!allowedContacts.includes(newAllowedContact)) {
      const updated = [...allowedContacts, newAllowedContact];
      setAllowedContacts(updated);
      localStorage.setItem('allowed_contacts', JSON.stringify(updated));
      setNewAllowedContact('');
      
      toast({
        title: "Contact Added",
        description: `${newAllowedContact} added to allowed contacts`,
      });
    }
  };
  
  // Remove a contact from the allowed list
  const handleRemoveAllowedContact = (contact: string) => {
    const updated = allowedContacts.filter(c => c !== contact);
    setAllowedContacts(updated);
    localStorage.setItem('allowed_contacts', JSON.stringify(updated));
    
    toast({
      title: "Contact Removed",
      description: `${contact} removed from allowed contacts`,
    });
  };
  
  // Send a new message (simulated)
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    // Check if message contains URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = newMessage.match(urlRegex) || [];
    const containsUrl = urls.length > 0;
    
    // Add new message to the list
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'Me',
      text: newMessage,
      timestamp: new Date(),
      isMine: true,
      containsUrl,
      urls: containsUrl ? urls : undefined
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replyTemplates = [
          "Thanks for the message!",
          "I'll check that out soon",
          "Got it, thanks!",
          "Nice, appreciate it",
          "That's interesting"
        ];
        
        const reply: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: selectedContact.name,
          text: replyTemplates[Math.floor(Math.random() * replyTemplates.length)],
          timestamp: new Date(),
          isMine: false,
          containsUrl: false
        };
        
        setMessages(prev => [...prev, reply]);
      }, Math.random() * 2000 + 1000);
    }
  };
  
  // Disconnect WhatsApp
  const handleDisconnect = () => {
    setIsConnected(false);
    setShowQr(false);
    setMessages([]);
    setContacts([]);
    setSelectedContact(null);
    localStorage.removeItem('whatsapp_connected');
    
    toast({
      title: "WhatsApp Disconnected",
      description: "Your WhatsApp connection has been closed",
    });
  };

  // Scan URL in message
  const handleScanMessage = (message: Message) => {
    if (!message.containsUrl) return;
    
    // Update message to show scanning
    const updatingMsg = { ...message, isScanning: true }; // Changed from scanning to isScanning
    setMessages(messages.map(m => m.id === message.id ? updatingMsg : m));
    
    // Simulate scanning process
    setTimeout(() => {
      // Generate random threat score (for demo)
      const isThreat = Math.random() < 0.3;
      const threatScore = isThreat ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30);
      
      // Update message with scan results
      const updatedMsg = { 
        ...message, 
        scanned: true, 
        isThreat, 
        threatScore,
        isScanning: false // Changed from scanning to isScanning
      };
      
      setMessages(messages.map(m => m.id === message.id ? updatedMsg : m));
      
      if (isThreat) {
        toast({
          title: "Threat Detected",
          description: `Found a potentially dangerous URL in message from ${message.sender}`,
          variant: "destructive",
        });
      }
    }, 2000);
  };
  
  // If not connected, show connection screen
  if (!isConnected) {
    return (
      <ConnectionScreen 
        isConnecting={isConnecting}
        showQr={showQr}
        qrCodeUrl={qrCodeUrl}
        handleConnect={handleConnect}
        handleQrScanComplete={handleQrScanComplete}
        setShowQr={setShowQr}
      />
    );
  }
  
  // Main connected interface
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Realtime</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and threat protection for your WhatsApp messages
          </p>
        </div>
        <Button variant="outline" onClick={handleDisconnect}>
          <Unlink className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
      
      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ContactsList 
              contacts={contacts}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              allowedContacts={allowedContacts}
            />
            
            <ChatWindow 
              selectedContact={selectedContact}
              messages={messages}
              handleScanMessage={handleScanMessage}
              handleSendMessage={handleSendMessage}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              allowedContacts={allowedContacts}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab 
            allowedContacts={allowedContacts}
            newAllowedContact={newAllowedContact}
            setNewAllowedContact={setNewAllowedContact}
            handleAddAllowedContact={handleAddAllowedContact}
            handleRemoveAllowedContact={handleRemoveAllowedContact}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppRealtime;
