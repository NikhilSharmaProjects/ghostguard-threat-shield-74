
import React from 'react';
import ShieldAnimation from '@/components/ShieldAnimation';

interface ScanningLoaderProps {
  message?: string;
}

const ScanningLoader: React.FC<ScanningLoaderProps> = ({ 
  message = "GhostGuard AI is inspecting the URL for potential threats..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <ShieldAnimation size="md" />
      <h3 className="mt-6 text-xl font-medium">Analyzing URL</h3>
      <p className="text-muted-foreground mt-2">
        {message}
      </p>
    </div>
  );
};

export default ScanningLoader;
