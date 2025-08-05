import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GitCompare, CheckCircle } from 'lucide-react';

interface ReconciliationProgress {
  stage: 'parsing' | 'reconciling' | 'complete';
  progress: number;
  message: string;
}

interface ProcessingProgressProps {
  progress: ReconciliationProgress;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ progress }) => {
  const getStageIcon = (stage: string, currentStage: string) => {
    const isActive = stage === currentStage;
    const isComplete = 
      (stage === 'parsing' && ['reconciling', 'complete'].includes(currentStage)) ||
      (stage === 'reconciling' && currentStage === 'complete');
    
    const iconClass = `h-5 w-5 ${
      isComplete ? 'text-green-600' : 
      isActive ? 'text-primary' : 
      'text-muted-foreground'
    }`;

    switch (stage) {
      case 'parsing':
        return <FileText className={iconClass} />;
      case 'reconciling':
        return <GitCompare className={iconClass} />;
      case 'complete':
        return <CheckCircle className={iconClass} />;
      default:
        return null;
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'parsing':
        return 'Parsing CSV Files';
      case 'reconciling':
        return 'Reconciling Transactions';
      case 'complete':
        return 'Complete';
      default:
        return stage;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Processing Transactions</CardTitle>
        <CardDescription>{progress.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {/* Stage Indicators */}
        <div className="space-y-3">
          {['parsing', 'reconciling', 'complete'].map((stage) => {
            const isActive = stage === progress.stage;
            const isComplete = 
              (stage === 'parsing' && ['reconciling', 'complete'].includes(progress.stage)) ||
              (stage === 'reconciling' && progress.stage === 'complete');

            return (
              <div key={stage} className="flex items-center space-x-3">
                {getStageIcon(stage, progress.stage)}
                <span className={`text-sm font-medium ${
                  isComplete ? 'text-green-600' :
                  isActive ? 'text-foreground' :
                  'text-muted-foreground'
                }`}>
                  {getStageLabel(stage)}
                </span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
                {isComplete && (
                  <div className="ml-auto">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance Tips */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            💡 Large files are processed in chunks to prevent browser freezing. 
            This ensures smooth performance even with 10,000+ transactions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};