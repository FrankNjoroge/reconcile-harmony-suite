import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useReconciliation } from '@/contexts/ReconciliationContext';

const ActivityLog: React.FC = () => {
  const { activityLog } = useReconciliation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Activity Log</h1>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        {activityLog.length === 0 ? (
          <Card className="bg-muted/20">
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground">
                Your reconciliation activity will appear here as you process files.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activityLog.map((entry) => (
              <Card key={entry.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      <span>Reconciliation Process</span>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Files Processed</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                          <span>Internal: {entry.internalFileName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                          <span>Provider: {entry.providerFileName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Matched: {entry.summary.matched}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Internal Only: {entry.summary.internalOnly}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Provider Only: {entry.summary.providerOnly}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <span>Mismatched: {entry.summary.mismatched}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Total Internal: ${entry.summary.totalInternal.toLocaleString()}</span>
                      <span>Total Provider: ${entry.summary.totalProvider.toLocaleString()}</span>
                      <span className={`font-medium ${
                        entry.summary.matched / entry.summary.totalInternal > 0.95 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        Match Rate: {((entry.summary.matched / entry.summary.totalInternal) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
