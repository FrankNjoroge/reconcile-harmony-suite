
import React, { useState } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction, MismatchedTransaction, ReconciliationResult } from '@/types/reconciliation';
import { exportReconciliationResults } from '@/utils/csvExporter';

interface TransactionTableProps {
  title: string;
  transactions: Transaction[] | MismatchedTransaction[];
  type: keyof ReconciliationResult['categories'];
  results: ReconciliationResult;
  icon: React.ReactNode;
  colorClass: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title,
  transactions,
  type,
  results,
  icon,
  colorClass
}) => {
  const [sortField, setSortField] = useState<string>('transaction_reference');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAll, setShowAll] = useState(false);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    if (type === 'mismatched') {
      const aMismatch = a as MismatchedTransaction;
      const bMismatch = b as MismatchedTransaction;
      aValue = (aMismatch.internal as any)[sortField];
      bValue = (bMismatch.internal as any)[sortField];
    } else {
      aValue = (a as any)[sortField];
      bValue = (b as any)[sortField];
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue || '').toLowerCase();
    const bStr = String(bValue || '').toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });
  
  const displayTransactions = showAll ? sortedTransactions : sortedTransactions.slice(0, 10);
  
  const handleExport = () => {
    exportReconciliationResults(results, type);
  };
  
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };
  
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
            <span className="text-sm font-normal text-gray-500">(0 transactions)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No transactions in this category.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
            <span className="text-sm font-normal text-gray-500">({transactions.length} transactions)</span>
          </CardTitle>
          <Button onClick={handleExport} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('transaction_reference')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Reference</span>
                    <SortIcon field="transaction_reference" />
                  </div>
                </TableHead>
                {type === 'mismatched' ? (
                  <>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Internal Amount</span>
                        <SortIcon field="amount" />
                      </div>
                    </TableHead>
                    <TableHead>Provider Amount</TableHead>
                    <TableHead>Internal Status</TableHead>
                    <TableHead>Provider Status</TableHead>
                    <TableHead>Differences</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        <SortIcon field="amount" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <SortIcon field="status" />
                      </div>
                    </TableHead>
                    <TableHead>Timestamp</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.map((transaction, index) => {
                if (type === 'mismatched') {
                  const mismatch = transaction as MismatchedTransaction;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{mismatch.internal.transaction_reference}</TableCell>
                      <TableCell className={mismatch.differences.amount ? 'bg-red-50 text-red-700' : ''}>
                        ${mismatch.internal.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className={mismatch.differences.amount ? 'bg-red-50 text-red-700' : ''}>
                        ${mismatch.provider.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className={mismatch.differences.status ? 'bg-red-50 text-red-700' : ''}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mismatch.internal.status === 'completed' ? 'bg-green-100 text-green-700' :
                          mismatch.internal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {mismatch.internal.status}
                        </span>
                      </TableCell>
                      <TableCell className={mismatch.differences.status ? 'bg-red-50 text-red-700' : ''}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mismatch.provider.status === 'completed' ? 'bg-green-100 text-green-700' :
                          mismatch.provider.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {mismatch.provider.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {mismatch.differences.amount && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Amount</span>
                          )}
                          {mismatch.differences.status && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Status</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  const tx = transaction as Transaction;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{tx.transaction_reference}</TableCell>
                      <TableCell>${tx.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
        
        {transactions.length > 10 && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${transactions.length} Transactions`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
