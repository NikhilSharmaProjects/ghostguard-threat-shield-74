
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Brain, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIInsightsPanelProps {
  threatAnalysis: string;
  securityRecommendations: string[];
  isLoading?: boolean;
  onFeedback?: (helpful: boolean) => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  threatAnalysis,
  securityRecommendations,
  isLoading = false,
  onFeedback
}) => {
  return (
    <Card className="border border-ghost-100/10 bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-ghost-400" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </div>
          <Badge variant="outline" className="bg-ghost-400/10 text-ghost-400 border-ghost-400/20">
            BETA
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center py-6 space-y-2">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-ghost-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-ghost-300 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-t-2 border-ghost-200 animate-spin"></div>
            </div>
            <p className="text-muted-foreground">GhostGuard AI is analyzing this URL...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Threat Analysis</h3>
                <p className="text-muted-foreground text-sm">{threatAnalysis}</p>
              </div>
              
              {securityRecommendations.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Security Recommendations</h3>
                  <ul className="space-y-2">
                    {securityRecommendations.map((tip, index) => (
                      <li key={index} className="flex gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-ghost-400 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {onFeedback && (
                <div className="pt-2 mt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Was this AI analysis helpful?</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-ghost-400/20 hover:border-ghost-400 hover:bg-ghost-400/10"
                      onClick={() => onFeedback(true)}
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      Yes
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1 border-ghost-400/20 hover:border-ghost-400 hover:bg-ghost-400/10"
                      onClick={() => onFeedback(false)}
                    >
                      <ThumbsDown className="mr-1 h-4 w-4" />
                      No
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
