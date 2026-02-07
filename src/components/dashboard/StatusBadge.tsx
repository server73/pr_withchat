import type { PRStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status }: { status: PRStatus }) {
  const { bg, text } = STATUS_COLORS[status];
  return (
    <Badge variant="secondary" className={cn(bg, text, 'font-semibold text-xs')}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
