'use client';

import { useState, useMemo } from 'react';
import { usePR } from '@/lib/prContext';
import type { DashboardFilters } from '@/types';
import StatsCards from '@/components/dashboard/StatsCards';
import FilterBar from '@/components/dashboard/FilterBar';
import PRTable from '@/components/dashboard/PRTable';

export default function DashboardPage() {
  const { purchaseRequests } = usePR();
  const [filters, setFilters] = useState<DashboardFilters>({
    search: '',
    status: 'all',
    category: 'all',
  });

  const filteredData = useMemo(() => {
    return purchaseRequests.filter((pr) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          pr.id.toLowerCase().includes(q) ||
          pr.title.toLowerCase().includes(q) ||
          pr.requester.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.status !== 'all' && pr.status !== filters.status) return false;
      if (filters.category !== 'all' && pr.category !== filters.category) return false;
      return true;
    });
  }, [purchaseRequests, filters]);

  return (
    <div className="h-full overflow-y-auto bg-chat-bg">
      <div className="p-8 max-w-[1200px] mx-auto flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">구매요청 대시보드</h1>
            <p className="text-sm text-muted-foreground mt-1">전체 구매요청 현황을 한눈에 확인하세요</p>
          </div>
          <p className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{purchaseRequests.length}</span>건
          </p>
        </div>

        <StatsCards data={purchaseRequests} />
        <FilterBar filters={filters} onChange={setFilters} />
        <PRTable data={filteredData} />
      </div>
    </div>
  );
}
