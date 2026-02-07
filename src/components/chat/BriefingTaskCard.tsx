import type { ProcurementTask } from '@/types';
import { PROCUREMENT_CATEGORY_LABELS, PROCUREMENT_CATEGORY_COLORS, formatKRW } from '@/lib/constants';

interface BriefingTaskCardProps {
  task: ProcurementTask;
  onClick: (taskId: string) => void;
}

export default function BriefingTaskCard({ task, onClick }: BriefingTaskCardProps) {
  const colors = PROCUREMENT_CATEGORY_COLORS[task.category] || PROCUREMENT_CATEGORY_COLORS.pr_approval;
  const catLabel = PROCUREMENT_CATEGORY_LABELS[task.category] || task.category;

  return (
    <button
      onClick={() => onClick(task.id)}
      className={`w-full text-left p-4 rounded-xl border border-border bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${colors.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {catLabel}
            </span>
            {task.urgency === 'high' && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                긴급
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-foreground truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
        </div>
        <div className="text-right shrink-0">
          {task.amount && (
            <p className="text-sm font-bold text-foreground">{formatKRW(task.amount)}</p>
          )}
          {task.dueDate && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{task.dueDate}</p>
          )}
        </div>
      </div>
    </button>
  );
}
