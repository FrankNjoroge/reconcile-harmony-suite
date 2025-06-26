
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReconciliationResult } from '@/types/reconciliation';

interface ReconciliationSummaryProps {
  results: ReconciliationResult;
}

const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({ results }) => {
  const { summary } = results;
  
  const summaryCards = [
    {
      title: 'Matched Transactions',
      count: summary.matched,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/50',
      borderColor: 'border-green-200 dark:border-green-800',
      gradient: 'gradient-success'
    },
    {
      title: 'Internal Only',
      count: summary.internalOnly,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      borderColor: 'border-amber-200 dark:border-amber-800',
      gradient: 'gradient-warning'
    },
    {
      title: 'Provider Only',
      count: summary.providerOnly,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/50',
      borderColor: 'border-red-200 dark:border-red-800',
      gradient: 'gradient-danger'
    },
    {
      title: 'Mismatched',
      count: summary.mismatched,
      icon: RotateCcw,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      borderColor: 'border-blue-200 dark:border-blue-800',
      gradient: 'gradient-primary'
    }
  ];
  
  const totalTransactions = summary.totalInternal + summary.totalProvider;
  const matchRate = totalTransactions > 0 ? ((summary.matched / summary.totalInternal) * 100).toFixed(1) : 0;
  const discrepancyRate = totalTransactions > 0 ? (((summary.internalOnly + summary.providerOnly + summary.mismatched) / summary.totalInternal) * 100).toFixed(1) : 0;
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Reconciliation Results
          </h2>
          <p className="text-muted-foreground text-lg">
            Analysis of {summary.totalInternal} internal transactions vs {summary.totalProvider} provider transactions
          </p>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Match Rate</span>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{matchRate}%</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Discrepancy Rate</span>
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{discrepancyRate}%</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title} 
              className={`${card.bgColor} ${card.borderColor} border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-slide-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${card.color}`} />
                    <span>{card.title}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {totalTransactions > 0 ? ((card.count / summary.totalInternal) * 100).toFixed(1) : 0}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-3xl font-bold ${card.color} mb-2`}>
                  {card.count.toLocaleString()}
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${card.gradient} transition-all duration-500`}
                    style={{ 
                      width: `${totalTransactions > 0 ? (card.count / summary.totalInternal) * 100 : 0}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReconciliationSummary;
