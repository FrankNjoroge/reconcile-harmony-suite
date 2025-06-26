
import { Transaction, MismatchedTransaction, ReconciliationResult } from '@/types/reconciliation';

export class ReconciliationEngine {
  static reconcile(internalTransactions: Transaction[], providerTransactions: Transaction[]): ReconciliationResult {
    const matched: Transaction[] = [];
    const internalOnly: Transaction[] = [];
    const providerOnly: Transaction[] = [];
    const mismatched: MismatchedTransaction[] = [];
    
    // Create maps for efficient lookup
    const providerMap = new Map<string, Transaction>();
    providerTransactions.forEach(transaction => {
      providerMap.set(transaction.transaction_reference, transaction);
    });
    
    const processedProviderRefs = new Set<string>();
    
    // Process internal transactions
    internalTransactions.forEach(internalTx => {
      const providerTx = providerMap.get(internalTx.transaction_reference);
      
      if (!providerTx) {
        // Transaction only exists in internal system
        internalOnly.push(internalTx);
      } else {
        processedProviderRefs.add(internalTx.transaction_reference);
        
        // Check if amounts and status match
        const amountMatch = Math.abs(internalTx.amount - providerTx.amount) < 0.01; // Account for floating point precision
        const statusMatch = internalTx.status === providerTx.status;
        
        if (amountMatch && statusMatch) {
          // Perfect match
          matched.push(internalTx);
        } else {
          // Mismatch detected
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
    
    // Find provider-only transactions
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
}
