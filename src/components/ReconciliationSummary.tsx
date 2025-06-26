
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReconciliationResult } from '@/types/reconciliation';

interface ReconciliationSummaryProps {
  results: ReconciliationResult;
}

const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({ results }) => {
  const { summary } = results;
  
  const summaryCards = [
    {
      title: 'Matched',
      count: summary.matched,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Internal Only',
      count: summary.internalOnly,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Provider Only',
      count: summary.providerOnly,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Mismatched',
      count: summary.mismatched,
      icon: RotateCcw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];
  
  const totalTransactions = summary.totalInternal + summary.totalProvider;
  const matchRate = totalTransactions > 0 ? ((summary.matched / summary.totalInternal) * 100).toFixed(1) : 0;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reconciliation Results</h2>
        <p className="text-gray-600">
          Processed {summary.totalInternal} internal transactions vs {summary.totalProvider} provider transactions
        </p>
        <p className="text-lg font-semibold text-green-600 mt-2">
          Match Rate: {matchRate}%
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`${card.bgColor} ${card.borderColor} border-2`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${card.color}`} />
                  <span>{card.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-3xl font-bold ${card.color}`}>
                  {card.count.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalTransactions > 0 ? ((card.count / summary.totalInternal) * 100).toFixed(1) : 0}% of internal
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReconciliationSummary;
