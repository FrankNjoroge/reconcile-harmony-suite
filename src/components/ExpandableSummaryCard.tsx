
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProgressRing from './ProgressRing';
import TrendIndicator from './TrendIndicator';

interface ExpandableSummaryCardProps {
  title: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  details?: {
    label: string;
    value: string | number;
  }[];
  previousCount?: number;
}

const ExpandableSummaryCard: React.FC<ExpandableSummaryCardProps> = ({
  title,
  count,
  total,
  icon,
  color,
  bgColor,
  borderColor,
  gradient,
  details = [],
  previousCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slide-in group",
        bgColor,
        borderColor,
        "border-2 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn("p-1.5 rounded-lg", bgColor, "bg-opacity-50")}>
              {icon}
            </div>
            <span>{title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {percentage.toFixed(1)}%
            </Badge>
            {previousCount !== undefined && (
              <TrendIndicator 
                value={count} 
                previousValue={previousCount} 
                className="text-xs"
              />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className={cn("text-3xl font-bold", color)}>
              {count.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              of {total.toLocaleString()} total
            </div>
          </div>
          
          <ProgressRing 
            progress={percentage} 
            size="md"
            className={color}
          >
            <span className={cn("text-sm font-bold", color)}>
              {percentage.toFixed(0)}%
            </span>
          </ProgressRing>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-1000 ease-out shadow-sm",
              gradient
            )}
            style={{ 
              width: `${percentage}%`,
              boxShadow: `0 0 8px ${percentage > 0 ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`
            }}
          />
        </div>
        
        {/* Expandable Details */}
        {details.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-xs hover:bg-background/50"
            >
              <span>View Details</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            
            {isExpanded && (
              <div className="space-y-2 pt-2 border-t border-border/50 animate-fade-in">
                {details.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span className="font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpandableSummaryCard;
