import { useCallback, useRef } from 'react';
import { Transaction, ReconciliationResult } from '@/types/reconciliation';

interface UseWebWorkerReconciliationReturn {
  reconcileTransactions: (
    internalTransactions: Transaction[], 
    providerTransactions: Transaction[]
  ) => Promise<ReconciliationResult>;
  cancelReconciliation: () => void;
}

export const useWebWorkerReconciliation = (
  onProgress?: (progress: number, message: string) => void
): UseWebWorkerReconciliationReturn => {
  const workerRef = useRef<Worker | null>(null);
  const currentRequestRef = useRef<string | null>(null);

  const reconcileTransactions = useCallback(async (
    internalTransactions: Transaction[], 
    providerTransactions: Transaction[]
  ): Promise<ReconciliationResult> => {
    return new Promise((resolve, reject) => {
      try {
        // Clean up previous worker
        if (workerRef.current) {
          workerRef.current.terminate();
        }

        // Create new worker
        workerRef.current = new Worker(
          new URL('../workers/reconciliationWorker.ts', import.meta.url),
          { type: 'module' }
        );

        const requestId = crypto.randomUUID();
        currentRequestRef.current = requestId;

        // Set up message handler
        workerRef.current.onmessage = (event) => {
          const { type, requestId: responseRequestId } = event.data;
          
          // Ignore messages from cancelled requests
          if (responseRequestId !== currentRequestRef.current) return;

          switch (type) {
            case 'RECONCILE_PROGRESS':
              onProgress?.(event.data.progress, event.data.message);
              break;
              
            case 'RECONCILE_COMPLETE':
              resolve(event.data.result);
              // Clean up
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
              currentRequestRef.current = null;
              break;
              
            case 'RECONCILE_ERROR':
              reject(new Error(event.data.error));
              // Clean up
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
              currentRequestRef.current = null;
              break;
          }
        };

        workerRef.current.onerror = (error) => {
          reject(new Error(`Worker error: ${error.message}`));
          // Clean up
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
          currentRequestRef.current = null;
        };

        // Send data to worker
        workerRef.current.postMessage({
          type: 'RECONCILE',
          internalTransactions,
          providerTransactions,
          requestId
        });

      } catch (error) {
        reject(new Error(`Failed to initialize reconciliation worker: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }, [onProgress]);

  const cancelReconciliation = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    currentRequestRef.current = null;
  }, []);

  return {
    reconcileTransactions,
    cancelReconciliation
  };
};