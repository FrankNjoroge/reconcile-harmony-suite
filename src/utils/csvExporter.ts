
import { Transaction, MismatchedTransaction, ReconciliationResult } from '@/types/reconciliation';

export const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportReconciliationResults = (results: ReconciliationResult, category: keyof ReconciliationResult['categories']) => {
  const timestamp = new Date().toISOString().split('T')[0];
  let data: any[] = [];
  let filename = '';
  
  switch (category) {
    case 'matched':
      data = results.categories.matched;
      filename = `reconciliation_matched_${timestamp}.csv`;
      break;
      
    case 'internalOnly':
      data = results.categories.internalOnly.map(tx => ({
        ...tx,
        category: 'Internal Only'
      }));
      filename = `reconciliation_internal_only_${timestamp}.csv`;
      break;
      
    case 'providerOnly':
      data = results.categories.providerOnly.map(tx => ({
        ...tx,
        category: 'Provider Only'
      }));
      filename = `reconciliation_provider_only_${timestamp}.csv`;
      break;
      
    case 'mismatched':
      data = results.categories.mismatched.map(item => ({
        transaction_reference: item.internal.transaction_reference,
        internal_amount: item.internal.amount,
        provider_amount: item.provider.amount,
        internal_status: item.internal.status,
        provider_status: item.provider.status,
        amount_mismatch: item.differences.amount ? 'Yes' : 'No',
        status_mismatch: item.differences.status ? 'Yes' : 'No',
        internal_timestamp: item.internal.timestamp,
        provider_timestamp: item.provider.timestamp
      }));
      filename = `reconciliation_mismatched_${timestamp}.csv`;
      break;
  }
  
  if (data.length === 0) {
    alert(`No ${category} transactions to export.`);
    return;
  }
  
  exportToCSV(data, filename);
};
