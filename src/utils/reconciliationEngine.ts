
import { Transaction, MismatchedTransaction, ReconciliationResult } from '@/types/reconciliation';

export class ReconciliationEngine {
  static async reconcile(internalTransactions: Transaction[], providerTransactions: Transaction[]): Promise<ReconciliationResult> {
    const matched: Transaction[] = [];
    const internalOnly: Transaction[] = [];
    const providerOnly: Transaction[] = [];
    const mismatched: MismatchedTransaction[] = [];
    
    // Optimized O(n) comparison using Maps for instant lookup
    const providerMap = new Map<string, Transaction>();
    const processedProviderRefs = new Set<string>();
    
    // Build provider map for O(1) lookups
    providerTransactions.forEach(transaction => {
      providerMap.set(transaction.transaction_reference, transaction);
    });
    
    // Process internal transactions in batches to prevent CPU overheating
    const BATCH_SIZE = 1000;
    for (let i = 0; i < internalTransactions.length; i += BATCH_SIZE) {
      const batch = internalTransactions.slice(i, i + BATCH_SIZE);
      
      // Process batch
      batch.forEach(internalTx => {
        const providerTx = providerMap.get(internalTx.transaction_reference);
        
        if (!providerTx) {
          internalOnly.push(internalTx);
        } else {
          processedProviderRefs.add(internalTx.transaction_reference);
          
          // Optimized comparison with cached calculations
          const amountMatch = Math.abs(internalTx.amount - providerTx.amount) < 0.01;
          const statusMatch = internalTx.status === providerTx.status;
          
          if (amountMatch && statusMatch) {
            matched.push(internalTx);
          } else {
            mismatched.push({
              internal: internalTx,
              provider: providerTx,
              differences: {
                amount: !amountMatch,
                status: !statusMatch
              }
            });
          }
        }
      });
      
      // Allow UI thread to breathe between batches
      if (i + BATCH_SIZE < internalTransactions.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Find provider-only transactions efficiently
    providerTransactions.forEach(providerTx => {
      if (!processedProviderRefs.has(providerTx.transaction_reference)) {
        providerOnly.push(providerTx);
      }
    });
    
    return {
      summary: {
        totalInternal: internalTransactions.length,
        totalProvider: providerTransactions.length,
        matched: matched.length,
        internalOnly: internalOnly.length,
        providerOnly: providerOnly.length,
        mismatched: mismatched.length
      },
      categories: {
        matched,
        internalOnly,
        providerOnly,
        mismatched
      }
    };
  }

  // New method for streaming reconciliation with progress callbacks
  static async reconcileWithProgress(
    internalTransactions: Transaction[], 
    providerTransactions: Transaction[],
    onProgress?: (progress: number) => void
  ): Promise<ReconciliationResult> {
    const matched: Transaction[] = [];
    const internalOnly: Transaction[] = [];
    const providerOnly: Transaction[] = [];
    const mismatched: MismatchedTransaction[] = [];
    
    const providerMap = new Map<string, Transaction>();
    const processedProviderRefs = new Set<string>();
    
    // Build provider map
    providerTransactions.forEach(transaction => {
      providerMap.set(transaction.transaction_reference, transaction);
    });
    
    // Process in chunks with progress updates
    const CHUNK_SIZE = 500;
    const totalChunks = Math.ceil(internalTransactions.length / CHUNK_SIZE);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, internalTransactions.length);
      const chunk = internalTransactions.slice(start, end);
      
      // Process chunk
      chunk.forEach(internalTx => {
        const providerTx = providerMap.get(internalTx.transaction_reference);
        
        if (!providerTx) {
          internalOnly.push(internalTx);
        } else {
          processedProviderRefs.add(internalTx.transaction_reference);
          
          const amountMatch = Math.abs(internalTx.amount - providerTx.amount) < 0.01;
          const statusMatch = internalTx.status === providerTx.status;
          
          if (amountMatch && statusMatch) {
            matched.push(internalTx);
          } else {
            mismatched.push({
              internal: internalTx,
              provider: providerTx,
              differences: {
                amount: !amountMatch,
                status: !statusMatch
              }
            });
          }
        }
      });
      
      // Update progress
      const progress = ((chunkIndex + 1) / totalChunks) * 80; // 80% for internal processing
      onProgress?.(progress);
      
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Process provider-only transactions
    providerTransactions.forEach(providerTx => {
      if (!processedProviderRefs.has(providerTx.transaction_reference)) {
        providerOnly.push(providerTx);
      }
    });
    
    onProgress?.(100);
    
    return {
      summary: {
        totalInternal: internalTransactions.length,
        totalProvider: providerTransactions.length,
        matched: matched.length,
        internalOnly: internalOnly.length,
        providerOnly: providerOnly.length,
        mismatched: mismatched.length
      },
      categories: {
        matched,
        internalOnly,
        providerOnly,
        mismatched
      }
    };
  }
}
