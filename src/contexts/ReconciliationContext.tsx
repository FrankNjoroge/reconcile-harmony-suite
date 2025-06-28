
import React, { createContext, useContext, useState } from 'react';
import { ReconciliationResult } from '@/types/reconciliation';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  internalFileName: string;
  providerFileName: string;
  summary: {
    totalInternal: number;
    totalProvider: number;
    matched: number;
    internalOnly: number;
    providerOnly: number;
    mismatched: number;
  };
}

interface ReconciliationContextType {
  currentResults: ReconciliationResult | null;
  setCurrentResults: (results: ReconciliationResult | null) => void;
  activityLog: ActivityLogEntry[];
  addToActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
}

const ReconciliationContext = createContext<ReconciliationContextType | undefined>(undefined);

export const useReconciliation = () => {
  const context = useContext(ReconciliationContext);
  if (!context) {
    throw new Error('useReconciliation must be used within a ReconciliationProvider');
  }
  return context;
};

export const ReconciliationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentResults, setCurrentResults] = useState<ReconciliationResult | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const addToActivityLog = (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [newEntry, ...prev]);
  };

  return (
    <ReconciliationContext.Provider
      value={{
        currentResults,
        setCurrentResults,
        activityLog,
        addToActivityLog,
      }}
    >
      {children}
    </ReconciliationContext.Provider>
  );
};
