import { useState, useCallback } from 'react';
import { Transaction, ReconciliationResult, ValidationError } from '@/types/reconciliation';
import { parseCSVChunked } from '@/utils/csvParser';
import { ReconciliationEngine } from '@/utils/reconciliationEngine';

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
}

export const useReconciliation = (): UseReconciliationReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ReconciliationProgress | null>(null);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const reconcileFiles = useCallback(async (internalFile: File, providerFile: File) => {
    setIsProcessing(true);
    setErrors([]);
    setResult(null);
    
    try {
      // Stage 1: Parse internal file
      setProgress({
        stage: 'parsing',
        progress: 0,
        message: 'Parsing internal transactions...'
      });

      const internalResult = await parseCSVChunked(internalFile, (progress) => {
        setProgress(prev => prev ? { ...prev, progress } : null);
      });

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

      // Stage 2: Parse provider file
      setProgress({
        stage: 'parsing',
        progress: 30,
        message: 'Parsing provider transactions...'
      });

      const providerResult = await parseCSVChunked(providerFile, (progress) => {
        setProgress(prev => prev ? { ...prev, progress: 30 + (progress * 0.3) } : null);
      });

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

      // Stage 3: Reconcile transactions
      setProgress({
        stage: 'reconciling',
        progress: 60,
        message: 'Reconciling transactions...'
      });

      const reconciliationResult = await ReconciliationEngine.reconcileWithProgress(
        internalResult.data,
        providerResult.data,
        (progress) => {
          setProgress(prev => prev ? { 
            ...prev, 
            progress: 60 + (progress * 0.4) // 40% of remaining progress
          } : null);
        }
      );

      setResult(reconciliationResult);
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Reconciliation complete!'
      });

      // Clear progress after 2 seconds
      setTimeout(() => {
        setProgress(null);
      }, 2000);

    } catch (error) {
      setErrors([{
        file: 'internal',
        message: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
    setErrors([]);
    setProgress(null);
  }, []);

  return {
    isProcessing,
    progress,
    result,
    errors,
    reconcileFiles,
    clearResults
  };
};