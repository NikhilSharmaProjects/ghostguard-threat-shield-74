
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ShieldAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ShieldAnimation: React.FC<ShieldAnimationProps> = ({ 
  size = 'md',
  className = ''
}) => {
  // Size-specific classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  };
  
  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer pulse effect */}
      <div className="absolute inset-0 rounded-full bg-ghost-400/20 animate-pulse"></div>
      
      {/* Inner shield */}
      <div className="relative z-10">
        <div className="threat-scan-container">
          <ShieldCheck className="w-full h-full text-ghost-400" />
          <div className="scan-line"></div>
        </div>
      </div>
    </div>
  );
};

export default ShieldAnimation;
