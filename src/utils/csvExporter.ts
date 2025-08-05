
import { Transaction, MismatchedTransaction, ReconciliationResult } from '@/types/reconciliation';

export interface ExportProgress {
  loading: boolean;
  progress: number;
  category: string | null;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

const escapeCSVValue = (value: any): string => {
  const stringValue = String(value || '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportToCSVWithProgress = async (
  data: any[], 
  filename: string, 
  categoryName: string,
  onProgress?: ExportProgressCallback
) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const CHUNK_SIZE = 1000;
  const headers = Object.keys(data[0]);
  const chunks: string[] = [];
  let processedRows = 0;

  // Notify start
  onProgress?.({ loading: true, progress: 0, category: categoryName });

  try {
    // Add headers
    chunks.push(headers.map(escapeCSVValue).join(',') + '\n');

    // Process data in chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      
      const csvChunk = chunk.map(row => 
        headers.map(header => escapeCSVValue(row[header])).join(',')
      ).join('\n') + '\n';
      
      chunks.push(csvChunk);
      processedRows += chunk.length;

      // Update progress
      const progress = Math.round((processedRows / data.length) * 100);
      onProgress?.({ loading: true, progress, category: categoryName });

      // Yield control to prevent browser freeze
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Create and download file
    const blob = new Blob(chunks, { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Complete
    onProgress?.({ loading: false, progress: 100, category: null });
    
  } catch (error) {
    onProgress?.({ loading: false, progress: 0, category: null });
    throw error;
  }
};

// Legacy function for backward compatibility
export const exportToCSV = (data: any[], filename: string) => {
  exportToCSVWithProgress(data, filename, 'Export').catch(console.error);
};

export const exportReconciliationResultsWithProgress = async (
  results: ReconciliationResult, 
  category: keyof ReconciliationResult['categories'],
  onProgress?: ExportProgressCallback
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  let data: any[] = [];
  let filename = '';
  let categoryName = '';
  
  switch (category) {
    case 'matched':
      data = results.categories.matched;
      filename = `reconciliation_matched_${timestamp}.csv`;
      categoryName = 'Matched';
      break;
      
    case 'internalOnly':
      data = results.categories.internalOnly.map(tx => ({
        ...tx,
        category: 'Internal Only'
      }));
      filename = `reconciliation_internal_only_${timestamp}.csv`;
      categoryName = 'Internal Only';
      break;
      
    case 'providerOnly':
      data = results.categories.providerOnly.map(tx => ({
        ...tx,
        category: 'Provider Only'
      }));
      filename = `reconciliation_provider_only_${timestamp}.csv`;
      categoryName = 'Provider Only';
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
      categoryName = 'Mismatched';
      break;
  }
  
  if (data.length === 0) {
    throw new Error(`No ${category} transactions to export.`);
  }
  
  await exportToCSVWithProgress(data, filename, categoryName, onProgress);
};

// Legacy function for backward compatibility
export const exportReconciliationResults = (results: ReconciliationResult, category: keyof ReconciliationResult['categories']) => {
  exportReconciliationResultsWithProgress(results, category).catch(error => {
    console.error('Export failed:', error);
    alert(`Export failed: ${error.message}`);
  });
};
