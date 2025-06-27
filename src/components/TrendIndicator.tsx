
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  showIcon?: boolean;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ 
  value, 
  previousValue, 
  showIcon = true, 
  className 
}) => {
  if (previousValue === undefined) {
    return null;
  }
  
  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  
  const colorClass = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : isNegative 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-gray-500 dark:text-gray-400';
    
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  return (
    <div className={cn("flex items-center space-x-1", colorClass, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-xs font-medium">
        {isNeutral ? '0%' : `${isPositive ? '+' : ''}${percentChange.toFixed(1)}%`}
      </span>
    </div>
  );
};

export default TrendIndicator;
