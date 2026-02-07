'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PurchaseRequest } from '@/types';
import { mockPurchaseRequests } from '@/lib/mockData';

interface PRContextValue {
  purchaseRequests: PurchaseRequest[];
  addPurchaseRequest: (pr: PurchaseRequest) => void;
}

const PRContext = createContext<PRContextValue | null>(null);

export function PRProvider({ children }: { children: ReactNode }) {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);

  const addPurchaseRequest = useCallback((pr: PurchaseRequest) => {
    setPurchaseRequests((prev) => [pr, ...prev]);
  }, []);

  return (
    <PRContext.Provider value={{ purchaseRequests, addPurchaseRequest }}>
      {children}
    </PRContext.Provider>
  );
}

export function usePR() {
  const context = useContext(PRContext);
  if (!context) {
    throw new Error('usePR must be used within a PRProvider');
  }
  return context;
}
