'use client';

import type { ProcurementTask } from '@/types';
import { formatKRW } from '@/lib/constants';
import { useBriefingConfig } from '@/lib/briefingConfigContext';
import { useUserBriefingPrefs } from '@/lib/userBriefingPrefsContext';

// 색상 토큰 → Tailwind 클래스 매핑
const COLOR_MAP: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-l-amber-400' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-l-blue-400' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400', border: 'border-l-violet-400' },
  green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400', border: 'border-l-green-400' },
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-l-red-400' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400', border: 'border-l-gray-400' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400', border: 'border-l-orange-400' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-400', border: 'border-l-cyan-400' },
};

interface BriefingTaskCardProps {
  task: ProcurementTask;
  onClick: (taskId: string) => void;
}

export default function BriefingTaskCard({ task, onClick }: BriefingTaskCardProps) {
  const { items } = useBriefingConfig();
  const { prefs } = useUserBriefingPrefs();

  // config에서 항목 메타 조회
  const itemConfig = items.find((i) => i.id === task.itemId);
  const itemLabel = itemConfig?.label || task.itemId;
  const colorToken = itemConfig?.color || 'amber';
  const colors = COLOR_MAP[colorToken] || COLOR_MAP.amber;

  const isCompact = prefs.density === 'compact';

  return (
    <button
      onClick={() => onClick(task.id)}
      className={`w-full text-left ${isCompact ? 'p-3' : 'p-4'} rounded-xl border border-border bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${colors.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {itemLabel}
            </span>
            {task.urgency === 'high' && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                긴급
              </span>
            )}
          </div>
          <p className="font-semibold text-sm text-foreground truncate">{task.title}</p>
          {!isCompact && (
            <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {prefs.showAmounts && task.amount && (
            <p className="text-sm font-bold text-foreground">{formatKRW(task.amount)}</p>
          )}
          {prefs.showDueDates && task.dueDate && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{task.dueDate}</p>
          )}
        </div>
      </div>
    </button>
  );
}
