import { useState, useCallback, useEffect } from 'react';
import { Transaction, ReconciliationResult, ValidationError } from '@/types/reconciliation';
import { useWebWorkerCSVParser } from './useWebWorkerCSVParser';
import { useWebWorkerReconciliation } from './useWebWorkerReconciliation';

interface ReconciliationProgress {
  stage: 'parsing' | 'reconciling' | 'complete';
  progress: number;
  message: string;
}

interface UseReconciliationReturn {
  isProcessing: boolean;
  progress: ReconciliationProgress | null;
  result: ReconciliationResult | null;
  errors: ValidationError[];
  reconcileFiles: (internalFile: File, providerFile: File) => Promise<void>;
  clearResults: () => void;
  cancelProcessing: () => void;
}

export const useReconciliation = (): UseReconciliationReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ReconciliationProgress | null>(null);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Web Worker hooks for parsing and reconciliation
  const { parseCSVFile: parseInternalFile, cancelParsing: cancelInternalParsing } = useWebWorkerCSVParser(
    (progress) => {
      setProgress(prev => prev ? { ...prev, progress: progress * 0.25 } : null);
    }
  );

  const { parseCSVFile: parseProviderFile, cancelParsing: cancelProviderParsing } = useWebWorkerCSVParser(
    (progress) => {
      setProgress(prev => prev ? { ...prev, progress: 25 + (progress * 0.25) } : null);
    }
  );

  const { reconcileTransactions, cancelReconciliation } = useWebWorkerReconciliation(
    (progress, message) => {
      setProgress(prev => prev ? { 
        ...prev, 
        progress: 50 + (progress * 0.5),
        message,
        stage: 'reconciling' as const
      } : null);
    }
  );

  // Memory cleanup effect
  useEffect(() => {
    return () => {
      // Clean up all workers on unmount
      cancelInternalParsing();
      cancelProviderParsing();
      cancelReconciliation();
      
      // Clear large objects
      setResult(null);
      setErrors([]);
      setProgress(null);
    };
  }, [cancelInternalParsing, cancelProviderParsing, cancelReconciliation]);

  const reconcileFiles = useCallback(async (internalFile: File, providerFile: File) => {
    // Critical: Clear all previous data before starting new reconciliation
    setResult(null);
    setErrors([]);
    setProgress(null);
    
    // Force garbage collection by clearing localStorage cache if it's too large
    try {
      const storageData = localStorage.getItem('reconciliation-sessions');
      if (storageData && storageData.length > 5 * 1024 * 1024) { // 5MB limit
        localStorage.removeItem('reconciliation-sessions');
        console.log('Cleared localStorage cache to prevent memory overload');
      }
    } catch (error) {
      console.warn('Could not check localStorage size:', error);
    }
    
    setIsProcessing(true);
    
    try {
      // Stage 1: Parse internal file with Web Worker
      setProgress({
        stage: 'parsing',
        progress: 0,
        message: 'Parsing internal transactions...'
      });

      const internalResult = await parseInternalFile(internalFile);

      if (internalResult.errors.length > 0) {
        const updatedErrors = internalResult.errors.map(error => ({
          ...error,
          file: 'internal' as const
        }));
        setErrors(updatedErrors);
        setIsProcessing(false);
        setProgress(null);
        return;
      }

      // Stage 2: Parse provider file with Web Worker
      setProgress({
        stage: 'parsing',
        progress: 25,
        message: 'Parsing provider transactions...'
      });

      const providerResult = await parseProviderFile(providerFile);

      if (providerResult.errors.length > 0) {
        const updatedErrors = providerResult.errors.map(error => ({
          ...error,
          file: 'provider' as const
        }));
        setErrors(updatedErrors);
        setIsProcessing(false);
        setProgress(null);
        return;
      }

      // Stage 3: Reconcile transactions with Web Worker
      setProgress({
        stage: 'reconciling',
        progress: 50,
        message: 'Starting reconciliation...'
      });

      const reconciliationResult = await reconcileTransactions(
        internalResult.data,
        providerResult.data
      );

      setResult(reconciliationResult);
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Reconciliation complete!'
      });

      // Clear progress after 2 seconds and force memory cleanup
      setTimeout(() => {
        setProgress(null);
        
        // Critical: Force memory cleanup
        if ((window as any).gc) {
          (window as any).gc();
        }
      }, 2000);

    } catch (error) {
      setErrors([{
        file: 'internal',
        message: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [parseInternalFile, parseProviderFile, reconcileTransactions]);

  const clearResults = useCallback(() => {
    // Critical: Aggressive memory cleanup
    setResult(null);
    setErrors([]);
    setProgress(null);
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
  }, []);

  const cancelProcessing = useCallback(() => {
    cancelInternalParsing();
    cancelProviderParsing();
    cancelReconciliation();
    setIsProcessing(false);
    setProgress(null);
  }, [cancelInternalParsing, cancelProviderParsing, cancelReconciliation]);

  return {
    isProcessing,
    progress,
    result,
    errors,
    reconcileFiles,
    clearResults,
    cancelProcessing
  };
};