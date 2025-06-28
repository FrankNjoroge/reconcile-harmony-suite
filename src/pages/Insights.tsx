import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChart, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import ReconciliationSummary from '@/components/ReconciliationSummary';

const Insights: React.FC = () => {
  const { currentResults, markResultsAsViewed } = useReconciliation();
  const navigate = useNavigate();

  // Mark results as viewed when component mounts
  useEffect(() => {
    if (currentResults) {
      markResultsAsViewed();
    }
  }, [currentResults, markResultsAsViewed]);

  if (!currentResults) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Reconciliation Insights</h1>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
          
          <Card className="bg-muted/20">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                Please complete a reconciliation process first to view insights and analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary } = currentResults;
  const matchRate = ((summary.matched / summary.totalInternal) * 100).toFixed(1);
  const errorRate = (((summary.internalOnly + summary.providerOnly + summary.mismatched) / summary.totalInternal) * 100).toFixed(1);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Reconciliation Insights</h1>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{matchRate}%</div>
              <p className="text-xs text-muted-foreground">
                {summary.matched} of {summary.totalInternal} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorRate}%</div>
              <p className="text-xs text-muted-foreground">
                Unmatched transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internal Total</CardTitle>
              <PieChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalInternal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total internal amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider Total</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalProvider.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total provider amount
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Summary */}
        <ReconciliationSummary results={currentResults} />

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.internalOnly > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800">Internal Only Transactions</h4>
                <p className="text-sm text-yellow-700">
                  {summary.internalOnly} transactions found only in internal system. 
                  Review if these were processed by the payment provider.
                </p>
              </div>
            )}
            
            {summary.providerOnly > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">Provider Only Transactions</h4>
                <p className="text-sm text-red-700">
                  {summary.providerOnly} transactions found only in provider statement. 
                  Check if these were recorded in your internal system.
                </p>
              </div>
            )}
            
            {summary.mismatched > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800">Mismatched Transactions</h4>
                <p className="text-sm text-blue-700">
                  {summary.mismatched} transactions have differences in amount or status. 
                  Review these discrepancies for data accuracy.
                </p>
              </div>
            )}

            {parseFloat(matchRate) > 95 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800">Excellent Match Rate</h4>
                <p className="text-sm text-green-700">
                  Your reconciliation shows a {matchRate}% match rate, indicating excellent data consistency.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
