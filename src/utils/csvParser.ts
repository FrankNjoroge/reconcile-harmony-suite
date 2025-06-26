
import Papa from 'papaparse';
import { Transaction, ValidationError } from '@/types/reconciliation';

export const parseCSV = (file: File): Promise<{ data: Transaction[], errors: ValidationError[] }> => {
  return new Promise((resolve) => {
    const errors: ValidationError[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Trim whitespace from all fields
        return typeof value === 'string' ? value.trim() : value;
      },
      complete: (results) => {
        const requiredFields = ['transaction_reference', 'amount', 'status'];
        const validStatuses = ['completed', 'pending', 'failed'];
        
        // Check if required columns exist
        if (results.meta.fields) {
          const missingFields = requiredFields.filter(field => 
            !results.meta.fields!.includes(field)
          );
          
          if (missingFields.length > 0) {
            errors.push({
              file: 'internal', // Will be updated by caller
              message: `Missing required columns: ${missingFields.join(', ')}`
            });
          }
        }
        
        const validTransactions: Transaction[] = [];
        
        results.data.forEach((row: any, index: number) => {
          const rowErrors: string[] = [];
          
          // Validate transaction_reference
          if (!row.transaction_reference || row.transaction_reference.toString().trim() === '') {
            rowErrors.push('transaction_reference is required');
          }
          
          // Validate amount
          const amount = parseFloat(row.amount);
          if (isNaN(amount)) {
            rowErrors.push('amount must be a valid number');
          }
          
          // Validate status
          if (!validStatuses.includes(row.status)) {
            rowErrors.push(`status must be one of: ${validStatuses.join(', ')}`);
          }
          
          if (rowErrors.length > 0) {
            errors.push({
              file: 'internal', // Will be updated by caller
              message: `Row ${index + 2}: ${rowErrors.join(', ')}`,
              row: index + 2
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
        
        resolve({ data: validTransactions, errors });
      },
      error: (error) => {
        errors.push({
          file: 'internal',
          message: `CSV parsing error: ${error.message}`
        });
        resolve({ data: [], errors });
      }
    });
  });
};

export const validateFile = (file: File): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    errors.push({
      file: 'internal',
      message: 'File size must be less than 10MB'
    });
  }
  
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errors.push({
      file: 'internal',
      message: 'File must be a CSV file'
    });
  }
  
  return errors;
};
