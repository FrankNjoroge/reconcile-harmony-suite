
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReconciliationSummary } from '@/types/reconciliation';

interface ReconciliationDonutChartProps {
  summary: ReconciliationSummary;
}

const ReconciliationDonutChart: React.FC<ReconciliationDonutChartProps> = ({ summary }) => {
  console.log('ReconciliationDonutChart received summary:', summary);
  
  const data = [
    { name: 'Matched', value: summary.matched, color: '#10b981' },
    { name: 'Internal Only', value: summary.internalOnly, color: '#f59e0b' },
    { name: 'Provider Only', value: summary.providerOnly, color: '#ef4444' },
    { name: 'Mismatched', value: summary.mismatched, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  console.log('ReconciliationDonutChart data after filtering:', data);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = summary.totalInternal || 1; // Avoid division by zero
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} transactions ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Show a message if no data
  if (data.length === 0) {
    return (
      <Card className="h-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">Transaction Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No data to display</p>
            <p className="text-sm">Upload files to see transaction breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Transaction Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ReconciliationDonutChart;
