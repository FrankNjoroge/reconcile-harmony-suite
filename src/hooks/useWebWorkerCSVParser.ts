import { useCallback, useRef } from 'react';
import { Transaction, ValidationError } from '@/types/reconciliation';

interface UseWebWorkerCSVParserReturn {
  parseCSVFile: (file: File) => Promise<{ data: Transaction[], errors: ValidationError[] }>;
  cancelParsing: () => void;
}

export const useWebWorkerCSVParser = (
  onProgress?: (progress: number) => void
): UseWebWorkerCSVParserReturn => {
  const workerRef = useRef<Worker | null>(null);
  const currentRequestRef = useRef<string | null>(null);

  const parseCSVFile = useCallback(async (file: File): Promise<{ data: Transaction[], errors: ValidationError[] }> => {
    // File validation before processing
    if (file.size > 50 * 1024 * 1024) {
      return {
        data: [],
        errors: [{
          file: 'internal',
          message: 'File size exceeds 50MB limit'
        }]
      };
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return {
        data: [],
        errors: [{
          file: 'internal',
          message: 'Invalid file format. Please upload CSV files only.'
        }]
      };
    }

    return new Promise((resolve, reject) => {
      try {
        // Clean up previous worker
        if (workerRef.current) {
          workerRef.current.terminate();
        }

        // Create new worker
        workerRef.current = new Worker(
          new URL('../workers/csvParserWorker.ts', import.meta.url),
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
            case 'PARSE_PROGRESS':
              onProgress?.(event.data.progress);
              break;
              
            case 'PARSE_COMPLETE':
              resolve({
                data: event.data.data,
                errors: event.data.errors
              });
              // Clean up
              if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
              }
              currentRequestRef.current = null;
              break;
              
            case 'PARSE_ERROR':
              resolve({
                data: [],
                errors: [{
                  file: 'internal',
                  message: event.data.error
                }]
              });
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
          resolve({
            data: [],
            errors: [{
              file: 'internal',
              message: `Worker error: ${error.message}`
            }]
          });
          // Clean up
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
          currentRequestRef.current = null;
        };

        // Convert file to ArrayBuffer and send to worker
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer && workerRef.current) {
            workerRef.current.postMessage({
              type: 'PARSE_CSV',
              fileData: reader.result,
              fileName: file.name,
              requestId
            });
          }
        };
        reader.onerror = () => {
          resolve({
            data: [],
            errors: [{
              file: 'internal',
              message: 'Failed to read file'
            }]
          });
        };
        reader.readAsArrayBuffer(file);

      } catch (error) {
        resolve({
          data: [],
          errors: [{
            file: 'internal',
            message: `Failed to initialize CSV parser: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        });
      }
    });
  }, [onProgress]);

  const cancelParsing = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    currentRequestRef.current = null;
  }, []);

  return {
    parseCSVFile,
    cancelParsing
  };
};