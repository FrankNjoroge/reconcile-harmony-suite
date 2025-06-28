
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { ReconciliationSummary } from '@/types/reconciliation';

interface ReconciliationDistributionChartProps {
  summary: ReconciliationSummary;
}

const ReconciliationDistributionChart: React.FC<ReconciliationDistributionChartProps> = ({ summary }) => {
  const data = [
    {
      name: 'Matched',
      value: summary.matched,
      color: '#10b981',
      icon: CheckCircle
    },
    {
      name: 'Internal Only',
      value: summary.internalOnly,
      color: '#f59e0b',
      icon: AlertTriangle
    },
    {
      name: 'Provider Only',
      value: summary.providerOnly,
      color: '#ef4444',
      icon: XCircle
    },
    {
      name: 'Mismatched',
      value: summary.mismatched,
      color: '#3b82f6',
      icon: RotateCcw
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} transactions ({((data.value / summary.totalInternal) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <span>Reconciliation Results Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Icon className="h-4 w-4" style={{ color: item.color }} />
                <span className="font-medium">{item.name}:</span>
                <span>{item.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReconciliationDistributionChart;
