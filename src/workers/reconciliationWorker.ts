// Web Worker for reconciliation processing to prevent CPU overheating
import { Transaction, MismatchedTransaction, ReconciliationResult } from '@/types/reconciliation';

interface ReconcileRequest {
  type: 'RECONCILE';
  internalTransactions: Transaction[];
  providerTransactions: Transaction[];
  requestId: string;
}

interface ReconcileProgress {
  type: 'RECONCILE_PROGRESS';
  progress: number;
  message: string;
  requestId: string;
}

interface ReconcileComplete {
  type: 'RECONCILE_COMPLETE';
  result: ReconciliationResult;
  requestId: string;
}

interface ReconcileError {
  type: 'RECONCILE_ERROR';
  error: string;
  requestId: string;
}

self.addEventListener('message', async (event: MessageEvent<ReconcileRequest>) => {
  const { type, internalTransactions, providerTransactions, requestId } = event.data;
  
  if (type !== 'RECONCILE') return;
  
  try {
    const result = await reconcileWithOptimizedPerformance(
      internalTransactions,
      providerTransactions,
      (progress, message) => {
        const progressResponse: ReconcileProgress = {
          type: 'RECONCILE_PROGRESS',
          progress,
          message,
          requestId
        };
        self.postMessage(progressResponse);
      }
    );
    
    const completeResponse: ReconcileComplete = {
      type: 'RECONCILE_COMPLETE',
      result,
      requestId
    };
    self.postMessage(completeResponse);
    
    // Force garbage collection by clearing references
    internalTransactions.length = 0;
    providerTransactions.length = 0;
    
  } catch (error) {
    const errorResponse: ReconcileError = {
      type: 'RECONCILE_ERROR',
      error: error instanceof Error ? error.message : 'Unknown reconciliation error',
      requestId
    };
    self.postMessage(errorResponse);
  }
});

async function reconcileWithOptimizedPerformance(
  internalTransactions: Transaction[],
  providerTransactions: Transaction[],
  onProgress: (progress: number, message: string) => void
): Promise<ReconciliationResult> {
  const matched: Transaction[] = [];
  const internalOnly: Transaction[] = [];
  const providerOnly: Transaction[] = [];
  const mismatched: MismatchedTransaction[] = [];
  
  onProgress(5, 'Building provider transaction index...');
  
  // Optimized O(1) lookup using Map - critical for performance
  const providerMap = new Map<string, Transaction>();
  const processedProviderRefs = new Set<string>();
  
  // Build provider map with yielding for large datasets
  const mapBuildBatchSize = 1000;
  for (let i = 0; i < providerTransactions.length; i += mapBuildBatchSize) {
    const batch = providerTransactions.slice(i, i + mapBuildBatchSize);
    batch.forEach(transaction => {
      providerMap.set(transaction.transaction_reference, transaction);
    });
    
    // Yield control every batch to prevent blocking
    if (i + mapBuildBatchSize < providerTransactions.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  onProgress(15, 'Starting transaction reconciliation...');
  
  // Process internal transactions in optimized batches
  const BATCH_SIZE = 500; // Reduced batch size for better responsiveness
  const totalBatches = Math.ceil(internalTransactions.length / BATCH_SIZE);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, internalTransactions.length);
    const batch = internalTransactions.slice(start, end);
    
    // Process each transaction in the batch
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
    
    // Update progress and yield control
    const progress = 15 + ((batchIndex + 1) / totalBatches) * 70; // 70% for internal processing
    onProgress(
      progress, 
      `Processing transactions: ${Math.min(end, internalTransactions.length)}/${internalTransactions.length}`
    );
    
    // Critical: Yield control every batch to prevent CPU overheating
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  
  onProgress(90, 'Finding provider-only transactions...');
  
  // Find provider-only transactions efficiently with yielding
  const providerBatchSize = 1000;
  for (let i = 0; i < providerTransactions.length; i += providerBatchSize) {
    const batch = providerTransactions.slice(i, i + providerBatchSize);
    
    batch.forEach(providerTx => {
      if (!processedProviderRefs.has(providerTx.transaction_reference)) {
        providerOnly.push(providerTx);
      }
    });
    
    // Yield control for large provider datasets
    if (i + providerBatchSize < providerTransactions.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  onProgress(100, 'Reconciliation complete!');
  
  const result = {
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
  
  // Clear large arrays to help garbage collection
  matched.length = 0;
  internalOnly.length = 0;
  providerOnly.length = 0;
  mismatched.length = 0;
  providerMap.clear();
  processedProviderRefs.clear();
  
  return result;
}

export {};