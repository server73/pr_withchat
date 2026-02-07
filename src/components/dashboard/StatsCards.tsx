import type { PurchaseRequest } from '@/types';
import { ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatsCardsProps {
  data: PurchaseRequest[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const total = data.length;
  const pending = data.filter((d) => d.status === 'pending' || d.status === 'in_review').length;
  const approved = data.filter((d) => d.status === 'approved').length;
  const rejected = data.filter((d) => d.status === 'rejected').length;

  const cards = [
    { label: '전체 요청', value: total, icon: ClipboardList, gradient: 'from-blue-500 to-blue-600', lightBg: 'bg-blue-50', lightText: 'text-blue-700' },
    { label: '처리 대기', value: pending, icon: Clock, gradient: 'from-amber-500 to-yellow-500', lightBg: 'bg-amber-50', lightText: 'text-amber-700' },
    { label: '승인 완료', value: approved, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600', lightBg: 'bg-emerald-50', lightText: 'text-emerald-700' },
    { label: '반려', value: rejected, icon: XCircle, gradient: 'from-red-500 to-rose-600', lightBg: 'bg-red-50', lightText: 'text-red-700' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-border/80 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] text-muted-foreground font-medium">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg ${card.lightBg} flex items-center justify-center ${card.lightText} group-hover:scale-110 transition-transform`}>
                <Icon className="w-[18px] h-[18px]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {card.value}
              <span className="text-sm text-muted-foreground ml-1.5 font-normal">건</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
