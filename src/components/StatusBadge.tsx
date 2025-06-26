
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    completed: {
      label: 'Completed',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-100'
    },
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100'
    },
    failed: {
      label: 'Failed',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
