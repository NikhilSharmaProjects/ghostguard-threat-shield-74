
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import MessageItem from './MessageItem';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
  containsUrl: boolean;
  urls?: string[];
  scanned?: boolean;
  isThreat?: boolean;
  threatScore?: number;
  isScanning?: boolean; // Added property
}

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  lastSeen?: Date;
  unreadCount?: number;
}

interface ChatWindowProps {
  selectedContact: Contact | null;
  messages: Message[];
  handleScanMessage: (message: Message) => void;
  handleSendMessage: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  allowedContacts: string[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedContact,
  messages,
  handleScanMessage,
  handleSendMessage,
  newMessage,
  setNewMessage,
  allowedContacts
}) => {
  return (
    <Card className="md:col-span-3 flex flex-col h-[70vh]">
      {selectedContact ? (
        <>
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg flex items-center">
              <span>{selectedContact.name}</span>
              {allowedContacts.includes(selectedContact.name) && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">
                  Protected
                </span>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 flex-grow overflow-y-auto space-y-4">
            {messages.map(message => (
              <MessageItem 
                key={message.id} 
                message={message} 
                handleScanMessage={handleScanMessage} 
              />
            ))}
          </CardContent>
          
          <CardFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-h-10 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                className="bg-ghost-400 hover:bg-ghost-500"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <p className="text-muted-foreground">
              Select a contact to start chatting
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChatWindow;
