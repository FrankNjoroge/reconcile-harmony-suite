
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReconciliationSummary } from '@/types/reconciliation';

interface AmountComparisonChartProps {
  summary: ReconciliationSummary;
}

const AmountComparisonChart: React.FC<AmountComparisonChartProps> = ({ summary }) => {
  // Generate mock amount data based on transaction counts
  const data = [
    {
      category: 'Matched',
      amount: summary.matched * 150.75,
      count: summary.matched,
      color: '#10b981'
    },
    {
      category: 'Internal Only',
      amount: summary.internalOnly * 125.50,
      count: summary.internalOnly,
      color: '#f59e0b'
    },
    {
      category: 'Provider Only',
      amount: summary.providerOnly * 165.25,
      count: summary.providerOnly,
      color: '#ef4444'
    },
    {
      category: 'Mismatched',
      amount: summary.mismatched * 140.80,
      count: summary.mismatched,
      color: '#3b82f6'
    }
  ].filter(item => item.count > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Amount: ${data.amount.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Transactions: {data.count.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Amount Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]}
              fill={(entry) => entry.color}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AmountComparisonChart;
