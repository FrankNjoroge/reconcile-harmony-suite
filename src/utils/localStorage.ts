
interface HistorySession {
  id: string;
  timestamp: string;
  internalFileName: string;
  providerFileName: string;
  summary: {
    matched: number;
    internalOnly: number;
    providerOnly: number;
    mismatched: number;
    totalInternal: number;
    totalProvider: number;
  };
  // Complete transaction data for insights
  transactionData?: {
    matched: any[];
    internalOnly: any[];
    providerOnly: any[];
    mismatched: any[];
  };
}

const STORAGE_KEY = 'transactron_reconciliation_history';
const MAX_SESSIONS = 15;

export const saveReconciliationSession = (
  internalFileName: string,
  providerFileName: string,
  summary: {
    matched: number;
    internalOnly: number;
    providerOnly: number;
    mismatched: number;
    totalInternal: number;
    totalProvider: number;
  },
  transactionData?: {
    matched: any[];
    internalOnly: any[];
    providerOnly: any[];
    mismatched: any[];
  }
): void => {
  try {
    const existingSessions = getReconciliationHistory();
    
    const newSession: HistorySession = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      internalFileName,
      providerFileName,
      summary,
      transactionData
    };

    const updatedSessions = [newSession, ...existingSessions].slice(0, MAX_SESSIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Failed to save reconciliation session:', error);
  }
};

export const getReconciliationHistory = (): HistorySession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load reconciliation history:', error);
    return [];
  }
};

export const clearReconciliationHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear reconciliation history:', error);
  }
};
