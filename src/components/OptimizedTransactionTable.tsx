import React, { useState, useMemo, useCallback } from 'react';
import { Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction, MismatchedTransaction } from '@/types/reconciliation';
import { exportToCSV } from '@/utils/csvExporter';
import StatusBadge from './StatusBadge';

interface OptimizedTransactionTableProps {
  title: string;
  transactions: Transaction[] | MismatchedTransaction[];
  category: 'matched' | 'internalOnly' | 'providerOnly' | 'mismatched';
  onExport: () => void;
}

// Memoized transaction row component for performance
const TransactionRow = React.memo<{
  transaction: Transaction | MismatchedTransaction;
  category: string;
  index: number;
}>(({ transaction, category, index }) => {
  const getRowBackgroundColor = () => {
    if (index % 2 === 0) return 'bg-background';
    return 'bg-muted/30';
  };

  if (category === 'mismatched') {
    const mismatch = transaction as MismatchedTransaction;
    return (
      <TableRow className={`group ${getRowBackgroundColor()}`}>
        <TableCell className="font-medium">{mismatch.internal.transaction_reference}</TableCell>
        <TableCell>${mismatch.internal.amount.toFixed(2)}</TableCell>
        <TableCell>${mismatch.provider.amount.toFixed(2)}</TableCell>
        <TableCell>
          <StatusBadge status={mismatch.internal.status} />
        </TableCell>
        <TableCell>
          <StatusBadge status={mismatch.provider.status} />
        </TableCell>
      </TableRow>
    );
  }

  const tx = transaction as Transaction;
  return (
    <TableRow className={`group ${getRowBackgroundColor()}`}>
      <TableCell className="font-medium">{tx.transaction_reference}</TableCell>
      <TableCell>${tx.amount.toFixed(2)}</TableCell>
      <TableCell>
        <StatusBadge status={tx.status} />
      </TableCell>
      {tx.timestamp && <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>}
      {tx.customer_id && <TableCell>{tx.customer_id}</TableCell>}
    </TableRow>
  );
});

TransactionRow.displayName = 'TransactionRow';

// Virtual scrolling hook for large datasets
const useVirtualScrolling = (items: any[], containerHeight: number = 400, itemHeight: number = 52) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, containerHeight, itemHeight]);

  return { visibleItems, setScrollTop };
};

export const OptimizedTransactionTable: React.FC<OptimizedTransactionTableProps> = ({
  title,
  transactions,
  category,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Debounced search with useMemo for performance
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    
    const searchLower = searchTerm.toLowerCase();
    return transactions.filter(transaction => {
      if (category === 'mismatched') {
        const mismatch = transaction as MismatchedTransaction;
        return mismatch.internal.transaction_reference.toLowerCase().includes(searchLower) ||
               mismatch.provider.transaction_reference.toLowerCase().includes(searchLower);
      }
      const tx = transaction as Transaction;
      return tx.transaction_reference.toLowerCase().includes(searchLower) ||
             tx.status.toLowerCase().includes(searchLower) ||
             (tx.customer_id && tx.customer_id.toLowerCase().includes(searchLower));
    });
  }, [transactions, searchTerm, category]);

  // Optimized sorting with memoization
  const sortedTransactions = useMemo(() => {
    if (!sortConfig) return filteredTransactions;

    return [...filteredTransactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (category === 'mismatched') {
        const aMismatch = a as MismatchedTransaction;
        const bMismatch = b as MismatchedTransaction;
        
        switch (sortConfig.key) {
          case 'reference':
            aValue = aMismatch.internal.transaction_reference;
            bValue = bMismatch.internal.transaction_reference;
            break;
          case 'amount':
            aValue = aMismatch.internal.amount;
            bValue = bMismatch.internal.amount;
            break;
          default:
            aValue = aMismatch.internal.transaction_reference;
            bValue = bMismatch.internal.transaction_reference;
        }
      } else {
        const aTx = a as Transaction;
        const bTx = b as Transaction;
        
        switch (sortConfig.key) {
          case 'reference':
            aValue = aTx.transaction_reference;
            bValue = bTx.transaction_reference;
            break;
          case 'amount':
            aValue = aTx.amount;
            bValue = bTx.amount;
            break;
          case 'status':
            aValue = aTx.status;
            bValue = bTx.status;
            break;
          default:
            aValue = aTx.transaction_reference;
            bValue = bTx.transaction_reference;
        }
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortConfig, category]);

  // Virtual scrolling for large datasets
  const { visibleItems, setScrollTop } = useVirtualScrolling(sortedTransactions, 400, 52);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const renderTableHeaders = () => {
    if (category === 'mismatched') {
      return (
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort('reference')}
                className="flex items-center gap-1 hover:text-foreground"
              >
                Transaction Ref
                {sortConfig?.key === 'reference' && (
                  sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>Internal Amount</TableHead>
            <TableHead>Provider Amount</TableHead>
            <TableHead>Internal Status</TableHead>
            <TableHead>Provider Status</TableHead>
          </TableRow>
        </TableHeader>
      );
    }

    return (
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              onClick={() => handleSort('reference')}
              className="flex items-center gap-1 hover:text-foreground"
            >
              Transaction Ref
              {sortConfig?.key === 'reference' && (
                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => handleSort('amount')}
              className="flex items-center gap-1 hover:text-foreground"
            >
              Amount
              {sortConfig?.key === 'amount' && (
                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => handleSort('status')}
              className="flex items-center gap-1 hover:text-foreground"
            >
              Status
              {sortConfig?.key === 'status' && (
                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button onClick={onExport} size="sm" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Virtual scrolling container for large datasets */}
      <div className="border rounded-md">
        <div 
          className="overflow-auto"
          style={{ height: '400px' }}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
          <Table>
            {renderTableHeaders()}
            <TableBody>
              <tr style={{ height: visibleItems.offsetY }} />
              {visibleItems.items.map((transaction, index) => (
                <TransactionRow
                  key={`${category}-${visibleItems.startIndex + index}`}
                  transaction={transaction}
                  category={category}
                  index={visibleItems.startIndex + index}
                />
              ))}
              <tr style={{ height: visibleItems.totalHeight - visibleItems.offsetY - (visibleItems.items.length * 52) }} />
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};