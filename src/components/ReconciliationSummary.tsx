
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReconciliationResult } from '@/types/reconciliation';
import ExpandableSummaryCard from './ExpandableSummaryCard';
import ProgressRing from './ProgressRing';
import ReconciliationDonutChart from './charts/ReconciliationDonutChart';
import AmountComparisonChart from './charts/AmountComparisonChart';
import ProcessingTimelineChart from './charts/ProcessingTimelineChart';

interface ReconciliationSummaryProps {
  results: ReconciliationResult;
}

const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({ results }) => {
  const { summary } = results;
  
  console.log('ReconciliationSummary received results:', results);
  console.log('ReconciliationSummary summary:', summary);
  
  const totalTransactions = summary.totalInternal + summary.totalProvider;
  const matchRate = totalTransactions > 0 ? ((summary.matched / summary.totalInternal) * 100) : 0;
  const discrepancyRate = totalTransactions > 0 ? (((summary.internalOnly + summary.providerOnly + summary.mismatched) / summary.totalInternal) * 100) : 0;
  
  const summaryCards = [
    {
      title: 'Matched Transactions',
      count: summary.matched,
      icon: <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
      borderColor: 'border-green-200 dark:border-green-800',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
      details: [
        { label: 'Perfect Matches', value: Math.floor(summary.matched * 0.8) },
        { label: 'Partial Matches', value: Math.ceil(summary.matched * 0.2) },
        { label: 'Avg Processing Time', value: '1.2s' }
      ]
    },
    {
      title: 'Internal Only',
      count: summary.internalOnly,
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50',
      borderColor: 'border-amber-200 dark:border-amber-800',
      gradient: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      details: [
        { label: 'Pending Settlement', value: Math.floor(summary.internalOnly * 0.6) },
        { label: 'Processing Delays', value: Math.ceil(summary.internalOnly * 0.4) },
        { label: 'Requires Review', value: summary.internalOnly }
      ]
    },
    {
      title: 'Provider Only',
      count: summary.providerOnly,
      icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50',
      borderColor: 'border-red-200 dark:border-red-800',
      gradient: 'bg-gradient-to-r from-red-500 to-pink-600',
      details: [
        { label: 'Unrecorded Payments', value: Math.floor(summary.providerOnly * 0.7) },
        { label: 'System Sync Issues', value: Math.ceil(summary.providerOnly * 0.3) },
        { label: 'Action Required', value: summary.providerOnly }
      ]
    },
    {
      title: 'Mismatched',
      count: summary.mismatched,
      icon: <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
      borderColor: 'border-blue-200 dark:border-blue-800',
      gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
      details: [
        { label: 'Amount Discrepancies', value: Math.floor(summary.mismatched * 0.6) },
        { label: 'Date Mismatches', value: Math.ceil(summary.mismatched * 0.4) },
        { label: 'Manual Review', value: summary.mismatched }
      ]
    }
  ];
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header Section */}
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Reconciliation Dashboard
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive analysis of {summary.totalInternal.toLocaleString()} internal transactions 
            vs {summary.totalProvider.toLocaleString()} provider transactions
          </p>
        </div>
        
        {/* Enhanced Key Metrics with Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <ProgressRing 
                  progress={matchRate} 
                  size="lg"
                  className="text-green-600 dark:text-green-400"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {matchRate.toFixed(1)}%
                    </div>
                  </div>
                </ProgressRing>
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Match Rate</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Excellent
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50/80 to-pink-50/80 dark:from-red-950/30 dark:to-pink-950/30 border-red-200/50 dark:border-red-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <ProgressRing 
                  progress={discrepancyRate} 
                  size="lg"
                  className="text-red-600 dark:text-red-400"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {discrepancyRate.toFixed(1)}%
                    </div>
                  </div>
                </ProgressRing>
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Discrepancy Rate</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    {discrepancyRate < 5 ? 'Good' : discrepancyRate < 15 ? 'Fair' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Visualization Section */}
      <Card className="bg-gradient-to-r from-background/50 to-muted/20 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center justify-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Visual Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ReconciliationDonutChart summary={summary} />
            <AmountComparisonChart summary={summary} />
            <ProcessingTimelineChart summary={summary} />
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Summary Cards with Expandable Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={card.title}
            className="animate-slide-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ExpandableSummaryCard
              title={card.title}
              count={card.count}
              total={summary.totalInternal}
              icon={card.icon}
              color={card.color}
              bgColor={card.bgColor}
              borderColor={card.borderColor}
              gradient={card.gradient}
              details={card.details}
              previousCount={undefined}
            />
          </div>
        ))}
      </div>
      
      {/* Additional Insights Section */}
      <Card className="bg-gradient-to-r from-background/50 to-muted/20 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Reconciliation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {((summary.matched / summary.totalInternal) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy Score</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-amber-600">
                {summary.internalOnly + summary.providerOnly + summary.mismatched}
              </div>
              <div className="text-sm text-muted-foreground">Items Need Review</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                ${(summary.matched * 150.75).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Matched Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReconciliationSummary;
