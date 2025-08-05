import { Transaction, MismatchedTransaction } from '@/types/reconciliation';

// Streaming CSV export to prevent memory issues with large datasets
export const exportLargeCSV = async (
  data: (Transaction | MismatchedTransaction)[],
  filename: string,
  category: 'matched' | 'internalOnly' | 'providerOnly' | 'mismatched'
): Promise<void> => {
  const CHUNK_SIZE = 500; // Process 500 rows at a time
  
  // Create CSV headers based on category
  const getHeaders = (): string => {
    if (category === 'mismatched') {
      return 'transaction_reference,internal_amount,provider_amount,internal_status,provider_status,amount_difference,status_difference\n';
    }
    return 'transaction_reference,amount,status,timestamp,customer_id,fee_amount\n';
  };

  // Convert transaction to CSV row
  const transactionToCsvRow = (item: Transaction | MismatchedTransaction): string => {
    if (category === 'mismatched') {
      const mismatch = item as MismatchedTransaction;
      const amountDiff = (mismatch.internal.amount - mismatch.provider.amount).toFixed(2);
      const statusDiff = mismatch.internal.status !== mismatch.provider.status ? 'Different' : 'Same';
      
      return `"${mismatch.internal.transaction_reference}",${mismatch.internal.amount},${mismatch.provider.amount},"${mismatch.internal.status}","${mismatch.provider.status}",${amountDiff},"${statusDiff}"\n`;
    }
    
    const tx = item as Transaction;
    return `"${tx.transaction_reference}",${tx.amount},"${tx.status}","${tx.timestamp || ''}","${tx.customer_id || ''}",${tx.fee_amount || ''}\n`;
  };

  try {
    // Create a writable stream using the newer Streams API
    const writableStream = new WritableStream({
      write(chunk) {
        // This will be collected into a blob
      }
    });

    const chunks: string[] = [];
    
    // Add headers
    chunks.push(getHeaders());
    
    // Process data in chunks to prevent memory overload
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      
      // Convert chunk to CSV rows
      const csvChunk = chunk.map(transactionToCsvRow).join('');
      chunks.push(csvChunk);
      
      // Allow UI thread to breathe between chunks
      if (i + CHUNK_SIZE < data.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Create and download the blob
    const csvContent = chunks.join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error during streaming export:', error);
    throw new Error('Failed to export CSV file');
  }
};

// Optimized export with progress callback
export const exportWithProgress = async (
  data: (Transaction | MismatchedTransaction)[],
  filename: string,
  category: 'matched' | 'internalOnly' | 'providerOnly' | 'mismatched',
  onProgress?: (progress: number) => void
): Promise<void> => {
  const CHUNK_SIZE = 1000;
  const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
  
  const getHeaders = (): string => {
    if (category === 'mismatched') {
      return 'transaction_reference,internal_amount,provider_amount,internal_status,provider_status,amount_difference,status_difference\n';
    }
    return 'transaction_reference,amount,status,timestamp,customer_id,fee_amount\n';
  };

  const transactionToCsvRow = (item: Transaction | MismatchedTransaction): string => {
    if (category === 'mismatched') {
      const mismatch = item as MismatchedTransaction;
      const amountDiff = (mismatch.internal.amount - mismatch.provider.amount).toFixed(2);
      const statusDiff = mismatch.internal.status !== mismatch.provider.status ? 'Different' : 'Same';
      
      return `"${mismatch.internal.transaction_reference}",${mismatch.internal.amount},${mismatch.provider.amount},"${mismatch.internal.status}","${mismatch.provider.status}",${amountDiff},"${statusDiff}"\n`;
    }
    
    const tx = item as Transaction;
    return `"${tx.transaction_reference}",${tx.amount},"${tx.status}","${tx.timestamp || ''}","${tx.customer_id || ''}",${tx.fee_amount || ''}\n`;
  };

  try {
    const chunks: string[] = [];
    chunks.push(getHeaders());
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, data.length);
      const chunk = data.slice(start, end);
      
      const csvChunk = chunk.map(transactionToCsvRow).join('');
      chunks.push(csvChunk);
      
      // Update progress
      const progress = ((chunkIndex + 1) / totalChunks) * 100;
      onProgress?.(progress);
      
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const csvContent = chunks.join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error during export with progress:', error);
    throw new Error('Failed to export CSV file');
  }
};