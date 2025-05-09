
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import ThreatBadge from '@/components/ThreatBadge';

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
  isScanning?: boolean; // Added property to fix the TS error
}

interface MessageItemProps {
  message: Message;
  handleScanMessage: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, handleScanMessage }) => {
  return (
    <div 
      key={message.id}
      className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          message.isMine 
            ? 'bg-ghost-400/90 text-white' 
            : 'bg-secondary'
        }`}
      >
        <div className="text-sm">{message.text}</div>
        <div className="text-xs mt-1 opacity-70">
          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
        </div>
        
        {message.containsUrl && (
          <div className="mt-2 pt-1 border-t border-white/20 text-xs flex items-center gap-2">
            {message.isScanning ? (
              <div className="flex items-center gap-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Scanning...</span>
              </div>
            ) : message.scanned ? (
              message.isThreat ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 text-red-200">
                    <ShieldAlert className="h-3 w-3" />
                    <span>Threat detected</span>
                  </div>
                  <ThreatBadge score={message.threatScore || 0} size="sm" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-200">
                  <ShieldCheck className="h-3 w-3" />
                  <span>URL verified safe</span>
                </div>
              )
            ) : !message.isMine ? (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-6 text-white/90 hover:text-white hover:bg-white/20"
                onClick={() => handleScanMessage(message)}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Scan URL
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
