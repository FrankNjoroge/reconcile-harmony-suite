
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReconciliationSummary } from '@/types/reconciliation';

interface ProcessingTimelineChartProps {
  summary: ReconciliationSummary;
}

const ProcessingTimelineChart: React.FC<ProcessingTimelineChartProps> = ({ summary }) => {
  // Generate mock timeline data based on reconciliation results
  const generateTimelineData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const totalTransactions = summary.totalInternal;
    
    return hours.map(hour => {
      const baseVolume = Math.sin((hour - 9) / 24 * Math.PI * 2) * 0.3 + 0.7;
      const volume = Math.max(0, Math.floor(totalTransactions * baseVolume * 0.1));
      const matchRate = 85 + Math.random() * 10; // 85-95% match rate
      
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        volume,
        matchRate: Math.round(matchRate),
        discrepancies: Math.floor(volume * (100 - matchRate) / 100)
      };
    });
  };

  const data = generateTimelineData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">Time: {label}</p>
          <p className="text-sm text-green-600">
            Volume: {payload[0]?.value || 0} transactions
          </p>
          <p className="text-sm text-blue-600">
            Match Rate: {payload[1]?.value || 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Processing Timeline (24h)</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              interval={3}
            />
            <YAxis 
              yAxisId="volume"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              orientation="left"
            />
            <YAxis 
              yAxisId="rate"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              orientation="right"
              domain={[80, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              yAxisId="volume"
              type="monotone" 
              dataKey="volume" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="rate"
              type="monotone" 
              dataKey="matchRate" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProcessingTimelineChart;
