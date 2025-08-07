// Web Worker for CSV parsing to prevent UI thread blocking
import Papa from 'papaparse';
import { Transaction, ValidationError } from '@/types/reconciliation';

interface ParseRequest {
  type: 'PARSE_CSV';
  fileData: ArrayBuffer;
  fileName: string;
  requestId: string;
}

interface ParseProgress {
  type: 'PARSE_PROGRESS';
  progress: number;
  requestId: string;
}

interface ParseComplete {
  type: 'PARSE_COMPLETE';
  data: Transaction[];
  errors: ValidationError[];
  requestId: string;
}

interface ParseError {
  type: 'PARSE_ERROR';
  error: string;
  requestId: string;
}

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

self.addEventListener('message', async (event: MessageEvent<ParseRequest>) => {
  const { type, fileData, fileName, requestId } = event.data;
  
  if (type !== 'PARSE_CSV') return;
  
  try {
    // Validate file size
    if (fileData.byteLength > MAX_FILE_SIZE) {
      const errorResponse: ParseError = {
        type: 'PARSE_ERROR',
        error: 'File size exceeds 50MB limit',
        requestId
      };
      self.postMessage(errorResponse);
      return;
    }
    
    // Convert ArrayBuffer to File-like object
    const fileContent = new TextDecoder().decode(fileData);
    
    const errors: ValidationError[] = [];
    const validTransactions: Transaction[] = [];
    const requiredFields = ['transaction_reference', 'amount', 'status'];
    const validStatuses = ['completed', 'pending', 'failed'];
    let processedRows = 0;
    let hasValidatedHeaders = false;
    
    // Estimate total rows for progress calculation
    const estimatedRows = Math.ceil(fileContent.length / 100); // Rough estimate
    
    await new Promise<void>((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        chunkSize: 512 * 1024, // 512KB chunks for optimal performance
        transform: (value) => typeof value === 'string' ? value.trim() : value,
        chunk: async (results, parser) => {
          // Validate headers on first chunk
          if (!hasValidatedHeaders) {
            if (results.meta.fields) {
              const missingFields = requiredFields.filter(field => 
                !results.meta.fields!.includes(field)
              );
              
              if (missingFields.length > 0) {
                errors.push({
                  file: 'internal',
                  message: `Missing required columns: ${missingFields.join(', ')}`
                });
                parser.abort();
                reject(new Error('Invalid CSV structure'));
                return;
              }
            }
            hasValidatedHeaders = true;
          }

          // Process chunk with memory-efficient batching
          const batchSize = 100;
          for (let i = 0; i < results.data.length; i += batchSize) {
            const batch = results.data.slice(i, i + batchSize);
            
            batch.forEach((row: any, index: number) => {
              const rowErrors: string[] = [];
              const absoluteRowIndex = processedRows + i + index + 1;
              
              // Validate required fields
              if (!row.transaction_reference || row.transaction_reference.toString().trim() === '') {
                rowErrors.push('transaction_reference is required');
              }
              
              const amount = parseFloat(row.amount);
              if (isNaN(amount)) {
                rowErrors.push('amount must be a valid number');
              }
              
              if (!validStatuses.includes(row.status)) {
                rowErrors.push(`status must be one of: ${validStatuses.join(', ')}`);
              }
              
              if (rowErrors.length > 0) {
                errors.push({
                  file: 'internal',
                  message: `Row ${absoluteRowIndex}: ${rowErrors.join(', ')}`,
                  row: absoluteRowIndex
                });
              } else {
                validTransactions.push({
                  transaction_reference: row.transaction_reference.toString(),
                  amount: amount,
                  status: row.status,
                  timestamp: row.timestamp || undefined,
                  customer_id: row.customer_id || undefined,
                  fee_amount: row.fee_amount ? parseFloat(row.fee_amount) : undefined
                });
              }
            });
            
            // Yield control every batch to prevent blocking
            if (i + batchSize < results.data.length) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }

          processedRows += results.data.length;
          
          // Send progress update
          const progress = Math.min((processedRows / estimatedRows) * 100, 95);
          const progressResponse: ParseProgress = {
            type: 'PARSE_PROGRESS',
            progress,
            requestId
          };
          self.postMessage(progressResponse);
          
          // Yield control between chunks
          await new Promise(resolve => setTimeout(resolve, 10));
        },
        complete: () => {
          resolve();
        },
        error: (error) => {
          errors.push({
            file: 'internal',
            message: `CSV parsing error: ${error.message}`
          });
          reject(error);
        }
      });
    });

    // Send completion message
    const completeResponse: ParseComplete = {
      type: 'PARSE_COMPLETE',
      data: validTransactions,
      errors,
      requestId
    };
    self.postMessage(completeResponse);
    
    // Clear memory immediately
    validTransactions.length = 0;
    errors.length = 0;
    
  } catch (error) {
    const errorResponse: ParseError = {
      type: 'PARSE_ERROR',
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      requestId
    };
    self.postMessage(errorResponse);
  }
});

export {};