
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import ReconciliationDistributionChart from '@/components/charts/ReconciliationDistributionChart';
import TransactionCountsChart from '@/components/charts/TransactionCountsChart';
import KeyMetricsCards from '@/components/charts/KeyMetricsCards';
import DataInterpretation from '@/components/charts/DataInterpretation';

const Reports: React.FC = () => {
  const { currentResults } = useReconciliation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
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
            {/* Key Metrics Cards */}
            <KeyMetricsCards summary={currentResults.summary} />

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReconciliationDistributionChart summary={currentResults.summary} />
              <TransactionCountsChart summary={currentResults.summary} />
            </div>

            {/* Data Interpretation */}
            <DataInterpretation summary={currentResults.summary} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
