import type { DashboardFilters } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { STATUS_LABELS, CATEGORY_LABELS } from '@/lib/constants';

interface FilterBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex gap-3 flex-wrap">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="PR번호, 제목, 요청자 검색..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          {/* 상태 필터 */}
          <Select
            value={filters.status}
            onValueChange={(value) => onChange({ ...filters, status: value as DashboardFilters['status'] })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">상태: 전체</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 유형 필터 */}
          <Select
            value={filters.category}
            onValueChange={(value) => onChange({ ...filters, category: value as DashboardFilters['category'] })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">유형: 전체</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
