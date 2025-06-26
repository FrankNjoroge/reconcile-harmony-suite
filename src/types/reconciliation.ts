
export interface Transaction {
  transaction_reference: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp?: string;
  customer_id?: string;
  fee_amount?: number;
}

export interface MismatchedTransaction {
  internal: Transaction;
  provider: Transaction;
  differences: {
    amount?: boolean;
    status?: boolean;
  };
}

export interface ReconciliationResult {
  summary: {
    totalInternal: number;
    totalProvider: number;
    matched: number;
    internalOnly: number;
    providerOnly: number;
    mismatched: number;
  };
  categories: {
    matched: Transaction[];
    internalOnly: Transaction[];
    providerOnly: Transaction[];
    mismatched: MismatchedTransaction[];
  };
}

export interface FileUploadState {
  internal: File | null;
  provider: File | null;
}

export interface ValidationError {
  file: 'internal' | 'provider';
  message: string;
  row?: number;
}
