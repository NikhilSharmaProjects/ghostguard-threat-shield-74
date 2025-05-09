
import React from 'react';
import { getThreatLevel, getThreatColor } from '@/lib/models';

interface ThreatScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThreatScoreGauge: React.FC<ThreatScoreGaugeProps> = ({ 
  score, 
  size = 'md', 
  showLabel = true 
}) => {
  const threatLevel = getThreatLevel(score);
  const colorClass = getThreatColor(threatLevel);
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
  };
  
  // Calculate the circumference of the circle
  const radius = size === 'sm' ? 24 : size === 'md' ? 38 : 50;
  const circumference = 2 * Math.PI * radius;
  // Calculate the filled part of the circle
  const filled = circumference - ((score / 100) * circumference);
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative flex items-center justify-center rounded-full ${sizeClasses[size]}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            className="text-muted/20"
          />
          {/* Foreground circle - progress indicator */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={filled}
            strokeLinecap="round"
            className={`${threatLevel === 'low' ? 'text-threat-low' : 
                          threatLevel === 'medium' ? 'text-threat-medium' : 
                          threatLevel === 'high' ? 'text-threat-high' : 
                          'text-threat-critical'}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-bold">{Math.round(score)}</span>
        </div>
      </div>
      
      {showLabel && (
        <div className={`mt-2 text-sm font-semibold px-3 py-1 rounded-full ${colorClass}`}>
          {threatLevel.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ThreatScoreGauge;
