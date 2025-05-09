
import React from 'react';
import { Shield, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react';
import { getThreatLevel, getThreatColor } from '@/lib/models';

interface ThreatBadgeProps {
  score: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThreatBadge: React.FC<ThreatBadgeProps> = ({ 
  score, 
  showText = true,
  size = 'md'
}) => {
  const threatLevel = getThreatLevel(score);
  const colorClass = getThreatColor(threatLevel);
  
  // Size-specific classes
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const paddings = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
    lg: 'px-3 py-1.5',
  };

  // Render appropriate icon based on threat level
  const renderIcon = () => {
    switch(threatLevel) {
      case 'critical':
        return <ShieldX className={`${iconSizes[size]}`} />;
      case 'high':
        return <ShieldAlert className={`${iconSizes[size]}`} />;
      case 'medium':
        return <ShieldQuestion className={`${iconSizes[size]}`} />;
      case 'low':
        return <Shield className={`${iconSizes[size]}`} />;
      default:
        return <Shield className={`${iconSizes[size]}`} />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border ${colorClass} ${paddings[size]}`}>
      {renderIcon()}
      {showText && (
        <span className={`font-medium ${textSizes[size]}`}>
          {threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1)}
        </span>
      )}
    </div>
  );
};

export default ThreatBadge;
