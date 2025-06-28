
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Percent } from 'lucide-react';
import { ReconciliationSummary } from '@/types/reconciliation';

interface KeyMetricsCardsProps {
  summary: ReconciliationSummary;
}

const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ summary }) => {
  const matchRate = ((summary.matched / summary.totalInternal) * 100).toFixed(1);
  const discrepancyCount = summary.internalOnly + summary.providerOnly + summary.mismatched;
  const discrepancyRate = ((discrepancyCount / summary.totalInternal) * 100).toFixed(1);
  const amountDifference = Math.abs(summary.totalInternal - summary.totalProvider);
  const amountAccuracy = (100 - (amountDifference / summary.totalInternal) * 100).toFixed(1);

  const metrics = [
    {
      title: 'Transaction Match Rate',
      value: `${matchRate}%`,
      subtitle: `${summary.matched} of ${summary.totalInternal} matched`,
      icon: parseFloat(matchRate) >= 95 ? CheckCircle : AlertCircle,
      color: parseFloat(matchRate) >= 95 ? 'text-green-600' : 'text-yellow-600',
      bgColor: parseFloat(matchRate) >= 95 ? 'bg-green-50' : 'bg-yellow-50'
    },
    {
      title: 'Discrepancy Rate',
      value: `${discrepancyRate}%`,
      subtitle: `${discrepancyCount} transactions need attention`,
      icon: parseFloat(discrepancyRate) <= 5 ? TrendingDown : TrendingUp,
      color: parseFloat(discrepancyRate) <= 5 ? 'text-green-600' : 'text-red-600',
      bgColor: parseFloat(discrepancyRate) <= 5 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Amount Accuracy',
      value: `${amountAccuracy}%`,
      subtitle: `$${amountDifference.toLocaleString()} difference`,
      icon: DollarSign,
      color: parseFloat(amountAccuracy) >= 99 ? 'text-green-600' : 'text-yellow-600',
      bgColor: parseFloat(amountAccuracy) >= 99 ? 'bg-green-50' : 'bg-yellow-50'
    },
    {
      title: 'Total Processing Efficiency',
      value: `${((summary.matched / summary.totalInternal) * 100).toFixed(0)}%`,
      subtitle: 'Overall reconciliation quality',
      icon: Percent,
      color: summary.matched / summary.totalInternal >= 0.95 ? 'text-green-600' : 'text-blue-600',
      bgColor: summary.matched / summary.totalInternal >= 0.95 ? 'bg-green-50' : 'bg-blue-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className={`${metric.bgColor} border-l-4 border-l-current`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{metric.title}</CardTitle>
              <Icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <p className="text-xs text-gray-600 mt-1">{metric.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KeyMetricsCards;
