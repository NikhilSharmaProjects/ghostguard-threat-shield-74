
import React from 'react';
import ShieldAnimation from '@/components/ShieldAnimation';

interface ScanningLoaderProps {
  message?: string;
  source?: 'url' | 'whatsapp' | 'email' | 'batch';
}

const ScanningLoader: React.FC<ScanningLoaderProps> = ({ 
  message,
  source = 'url'
}) => {
  // Default messages based on source
  const getDefaultMessage = () => {
    switch (source) {
      case 'whatsapp':
        return "GhostGuard AI is analyzing WhatsApp messages for potential threats...";
      case 'email':
        return "GhostGuard AI is scanning your emails for malicious links...";
      case 'batch':
        return "GhostGuard AI is processing multiple items for security threats...";
      case 'url':
      default:
        return "GhostGuard AI is inspecting the URL for potential threats...";
    }
  };

  const displayMessage = message || getDefaultMessage();
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <ShieldAnimation size="md" />
      <h3 className="mt-6 text-xl font-medium">
        {source === 'whatsapp' ? 'Analyzing Messages' : 
         source === 'email' ? 'Scanning Emails' :
         source === 'batch' ? 'Batch Scanning' : 'Analyzing URL'}
      </h3>
      <p className="text-muted-foreground mt-2">
        {displayMessage}
      </p>
    </div>
  );
};

export default ScanningLoader;
