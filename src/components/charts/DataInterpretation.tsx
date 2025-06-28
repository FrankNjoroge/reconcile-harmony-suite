
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { ReconciliationSummary } from '@/types/reconciliation';

interface DataInterpretationProps {
  summary: ReconciliationSummary;
}

const DataInterpretation: React.FC<DataInterpretationProps> = ({ summary }) => {
  const matchRate = (summary.matched / summary.totalInternal) * 100;
  const discrepancyCount = summary.internalOnly + summary.providerOnly + summary.mismatched;
  const amountDifference = Math.abs(summary.totalInternal - summary.totalProvider);
  const amountDifferencePercentage = (amountDifference / summary.totalInternal) * 100;

  const insights = [];

  // Match Rate Insights
  if (matchRate >= 98) {
    insights.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Excellent Data Quality',
      description: `Your ${matchRate.toFixed(1)}% match rate indicates exceptional data consistency between systems. This suggests robust transaction processing and minimal reconciliation issues.`,
      recommendation: 'Continue current processes and consider this as a benchmark for future reconciliations.'
    });
  } else if (matchRate >= 90) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Good Match Rate with Room for Improvement',
      description: `Your ${matchRate.toFixed(1)}% match rate is acceptable but could be optimized. There are ${discrepancyCount} transactions requiring attention.`,
      recommendation: 'Review transaction processing workflows to identify potential automation opportunities.'
    });
  } else {
    insights.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Significant Reconciliation Issues',
      description: `Your ${matchRate.toFixed(1)}% match rate indicates substantial discrepancies. ${discrepancyCount} transactions need immediate review.`,
      recommendation: 'Conduct a thorough review of data integration processes and implement additional validation checks.'
    });
  }

  // Amount Accuracy Insights
  if (amountDifferencePercentage <= 0.1) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Excellent Financial Accuracy',
      description: `Amount discrepancy of only $${amountDifference.toLocaleString()} (${amountDifferencePercentage.toFixed(2)}%) shows excellent financial controls.`,
      recommendation: 'Your financial reconciliation processes are performing exceptionally well.'
    });
  } else if (amountDifferencePercentage <= 1) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Minor Amount Discrepancies',
      description: `$${amountDifference.toLocaleString()} difference (${amountDifferencePercentage.toFixed(2)}%) suggests minor timing or rounding issues.`,
      recommendation: 'Review transaction timing and rounding policies to minimize future discrepancies.'
    });
  } else {
    insights.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Significant Amount Discrepancies',
      description: `$${amountDifference.toLocaleString()} difference (${amountDifferencePercentage.toFixed(2)}%) requires immediate investigation.`,
      recommendation: 'Urgent review needed to identify and resolve systematic amount discrepancies.'
    });
  }

  // Category-Specific Insights
  if (summary.internalOnly > 0) {
    insights.push({
      type: 'info',
      icon: Lightbulb,
      title: 'Internal-Only Transactions Analysis',
      description: `${summary.internalOnly} transactions appear only in your internal system. This could indicate payment processing delays or failed transactions.`,
      recommendation: 'Verify with payment provider if these transactions were successfully processed or if refunds/reversals occurred.'
    });
  }

  if (summary.providerOnly > 0) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Provider-Only Transactions Alert',
      description: `${summary.providerOnly} transactions appear only in provider statements. This could indicate missing internal records or data synchronization issues.`,
      recommendation: 'Review internal transaction recording processes and ensure all payment provider notifications are being captured.'
    });
  }

  if (summary.mismatched > 0) {
    insights.push({
      type: 'info',
      icon: Lightbulb,
      title: 'Mismatched Transactions Review',
      description: `${summary.mismatched} transactions have matching references but different amounts or statuses. This often indicates timing differences or fee discrepancies.`,
      recommendation: 'Review fee structures and transaction timing to resolve amount and status mismatches.'
    });
  }

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span>Data Interpretation & Business Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className={`p-4 rounded-lg border ${getCardStyle(insight.type)}`}>
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(insight.type)}`} />
                <div className="flex-1">
                  <h4 className={`font-semibold ${getIconColor(insight.type)}`}>
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 mb-3">
                    {insight.description}
                  </p>
                  <div className="bg-white/50 p-3 rounded border-l-4 border-l-current">
                    <p className="text-sm font-medium text-gray-800">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DataInterpretation;
