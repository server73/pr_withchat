import type { PurchaseRequest } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS, CATEGORY_COLORS, formatKRW } from '@/lib/constants';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';

interface PRTableProps {
  data: PurchaseRequest[];
}

export default function PRTable({ data }: PRTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">PR번호</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">제목</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">유형</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">요청자</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">부서</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">금액</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">상태</TableHead>
            <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">요청일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((pr) => {
            const catColor = CATEGORY_COLORS[pr.category] || { bg: 'bg-gray-100', text: 'text-gray-800' };
            return (
              <TableRow key={pr.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer">
                <TableCell className="py-3">
                  <span className="font-mono text-xs text-blue-600 font-medium">{pr.id}</span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="font-medium text-foreground">{pr.title}</span>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="secondary" className={cn(catColor.bg, catColor.text, 'font-medium text-xs')}>
                    {CATEGORY_LABELS[pr.category] || pr.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-foreground">{pr.requester}</TableCell>
                <TableCell className="py-3 text-muted-foreground">{pr.department}</TableCell>
                <TableCell className="py-3 text-right font-medium text-foreground">{formatKRW(pr.totalAmount)}</TableCell>
                <TableCell className="py-3">
                  <StatusBadge status={pr.status} />
                </TableCell>
                <TableCell className="py-3 text-xs text-muted-foreground">
                  {new Date(pr.createdAt).toLocaleDateString('ko-KR')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
