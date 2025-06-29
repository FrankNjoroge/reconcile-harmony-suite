
import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Scale, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TransactionTable from './TransactionTable';
import { ReconciliationResult } from '@/types/reconciliation';
import { exportReconciliationResults } from '@/utils/csvExporter';

interface UnifiedInsightsTableProps {
  results: ReconciliationResult;
}

const UnifiedInsightsTable: React.FC<UnifiedInsightsTableProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState('matched');

  const tabConfig = [
    {
      id: 'matched',
      label: 'Matched',
      icon: <CheckCircle className="h-4 w-4" />,
      count: results.summary.matched,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      activeBg: 'data-[state=active]:bg-green-100',
      transactions: results.categories.matched,
      exportLabel: 'Export Matched Transactions'
    },
    {
      id: 'internalOnly',
      label: 'Internal Only',
      icon: <AlertTriangle className="h-4 w-4" />,
      count: results.summary.internalOnly,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      activeBg: 'data-[state=active]:bg-amber-100',
      transactions: results.categories.internalOnly,
      exportLabel: 'Export Internal Only'
    },
    {
      id: 'providerOnly',
      label: 'Provider Only',
      icon: <XCircle className="h-4 w-4" />,
      count: results.summary.providerOnly,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      activeBg: 'data-[state=active]:bg-red-100',
      transactions: results.categories.providerOnly,
      exportLabel: 'Export Provider Only'
    },
    {
      id: 'mismatched',
      label: 'Mismatched',
      icon: <Scale className="h-4 w-4" />,
      count: results.summary.mismatched,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      activeBg: 'data-[state=active]:bg-orange-100',
      transactions: results.categories.mismatched,
      exportLabel: 'Export Mismatched Transactions'
    }
  ];

  const activeTabConfig = tabConfig.find(tab => tab.id === activeTab);

  const handleExport = () => {
    if (activeTabConfig) {
      exportReconciliationResults(results, activeTab as keyof ReconciliationResult['categories']);
    }
  };

  return (
    <Card className="shadow-xl backdrop-blur-sm bg-card/80 border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Transaction Analysis
          </CardTitle>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={!activeTabConfig || activeTabConfig.count === 0}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{activeTabConfig?.exportLabel}</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/30 backdrop-blur-sm rounded-xl p-1 md:p-2 mb-4 md:mb-6">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center space-x-1 transition-all duration-300 rounded-lg text-xs sm:text-sm ${tab.activeBg} data-[state=active]:shadow-lg`}
              >
                <span className={tab.color}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.charAt(0)}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4 md:mt-6">
              <div className={`rounded-lg border p-4 ${tab.bgColor}`}>
                <TransactionTable
                  title={`${tab.label} Transactions`}
                  transactions={tab.transactions}
                  type={tab.id as keyof ReconciliationResult['categories']}
                  results={results}
                  icon={React.cloneElement(tab.icon, { className: `h-5 w-5 ${tab.color}` })}
                  colorClass={tab.color}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedInsightsTable;
