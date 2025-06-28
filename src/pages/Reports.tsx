
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle } from 'lucide-react';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import ReconciliationDonutChart from '@/components/charts/ReconciliationDonutChart';
import AmountComparisonChart from '@/components/charts/AmountComparisonChart';
import ProcessingTimelineChart from '@/components/charts/ProcessingTimelineChart';

const Reports: React.FC = () => {
  const { currentResults } = useReconciliation();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center space-x-3 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>

        {!currentResults ? (
          <Card className="bg-muted/20">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
              <p className="text-muted-foreground">
                Complete a reconciliation process first to view detailed analytics and reports.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <ReconciliationDonutChart summary={currentResults.summary} />
              <AmountComparisonChart summary={currentResults.summary} />
              <ProcessingTimelineChart summary={currentResults.summary} />
            </div>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {((currentResults.summary.matched / currentResults.summary.totalInternal) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Match Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${currentResults.summary.totalInternal.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Internal Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${currentResults.summary.totalProvider.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Provider Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {currentResults.summary.internalOnly + currentResults.summary.providerOnly + currentResults.summary.mismatched}
                    </div>
                    <div className="text-sm text-muted-foreground">Discrepancies</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
