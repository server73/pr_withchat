'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserBriefingPrefs, UserItemPref, BriefingRoleId } from '@/types';

const DEFAULT_ITEM_PREFS: UserItemPref[] = [
  // 구매요청자
  { itemId: 'my_pr_status', visible: true, sortOrder: 0 },
  { itemId: 'my_approvals', visible: true, sortOrder: 1 },
  // 구매담당자
  { itemId: 'pr_approval', visible: true, sortOrder: 0 },
  { itemId: 'bidding', visible: true, sortOrder: 1 },
  { itemId: 'contract', visible: true, sortOrder: 2 },
  { itemId: 'po_delivery', visible: true, sortOrder: 3 },
  { itemId: 'vendor', visible: true, sortOrder: 4 },
  // 구매관리자
  { itemId: 'overdue_monitor', visible: true, sortOrder: 0 },
  { itemId: 'compliance_check', visible: true, sortOrder: 1 },
  { itemId: 'purchase_stats', visible: true, sortOrder: 2 },
];

const DEFAULT_PREFS: UserBriefingPrefs = {
  activeRoleId: 'manager',
  itemPrefs: DEFAULT_ITEM_PREFS,
  density: 'comfortable',
  urgencyFilter: 'all',
  showAmounts: true,
  showDueDates: true,
  greetingName: '김관리자',
  maxTasksPerItem: 0,
};

interface UserBriefingPrefsContextValue {
  prefs: UserBriefingPrefs;
  updatePrefs: (updates: Partial<UserBriefingPrefs>) => void;
  updateItemPref: (itemId: string, updates: Partial<UserItemPref>) => void;
  reorderItemPref: (fromIndex: number, toIndex: number) => void;
  resetPrefs: () => void;
}

const UserBriefingPrefsContext = createContext<UserBriefingPrefsContextValue | null>(null);

export function UserBriefingPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserBriefingPrefs>(DEFAULT_PREFS);

  const updatePrefs = useCallback((updates: Partial<UserBriefingPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateItemPref = useCallback((itemId: string, updates: Partial<UserItemPref>) => {
    setPrefs((prev) => ({
      ...prev,
      itemPrefs: prev.itemPrefs.map((ip) =>
        ip.itemId === itemId ? { ...ip, ...updates } : ip,
      ),
    }));
  }, []);

  const reorderItemPref = useCallback((fromIndex: number, toIndex: number) => {
    setPrefs((prev) => {
      const sorted = [...prev.itemPrefs].sort((a, b) => a.sortOrder - b.sortOrder);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      const reordered = sorted.map((ip, i) => ({ ...ip, sortOrder: i }));
      return { ...prev, itemPrefs: reordered };
    });
  }, []);

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
  }, []);

  return (
    <UserBriefingPrefsContext.Provider value={{ prefs, updatePrefs, updateItemPref, reorderItemPref, resetPrefs }}>
      {children}
    </UserBriefingPrefsContext.Provider>
  );
}

export function useUserBriefingPrefs() {
  const ctx = useContext(UserBriefingPrefsContext);
  if (!ctx) throw new Error('useUserBriefingPrefs must be used inside UserBriefingPrefsProvider');
  return ctx;
}
