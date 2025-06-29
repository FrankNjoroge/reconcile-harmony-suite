
import React from 'react';
import { Clock, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface HistorySession {
  id: string;
  timestamp: string;
  internalFileName: string;
  providerFileName: string;
  summary: {
    matched: number;
    internalOnly: number;
    providerOnly: number;
    mismatched: number;
    totalInternal: number;
    totalProvider: number;
  };
}

interface ReconciliationHistoryProps {
  sessions: HistorySession[];
}

const ReconciliationHistory: React.FC<ReconciliationHistoryProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Recent Sessions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.slice(0, 5).map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-background/80 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {session.internalFileName} + {session.providerFileName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <div className="flex items-center space-x-1 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-green-700 font-medium">{session.summary.matched}</span>
              </div>
              {session.summary.internalOnly > 0 && (
                <div className="flex items-center space-x-1 text-xs">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span className="text-amber-700 font-medium">{session.summary.internalOnly}</span>
                </div>
              )}
              {session.summary.providerOnly > 0 && (
                <div className="flex items-center space-x-1 text-xs">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="text-red-700 font-medium">{session.summary.providerOnly}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReconciliationHistory;
