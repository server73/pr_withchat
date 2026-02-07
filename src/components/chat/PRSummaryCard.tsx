'use client';

import type { PurchaseRequest } from '@/types';
import { URGENCY_LABELS, formatKRW } from '@/lib/constants';
import { useSchema } from '@/lib/schemaContext';
import { getAccent } from '@/lib/iconMap';

interface PRSummaryCardProps {
  pr: PurchaseRequest;
}

const CATEGORY_ACCENT: Record<string, string> = {
  general: 'border-l-violet-500',
  it_asset: 'border-l-blue-500',
  mro: 'border-l-amber-500',
};

const CATEGORY_LABELS_FALLBACK: Record<string, string> = {
  general: '일반 구매',
  it_asset: 'IT 자산',
  mro: 'MRO/소모품',
};

export default function PRSummaryCard({ pr }: PRSummaryCardProps) {
  const { details } = pr;
  const { getSchema } = useSchema();

  // 동적 accent color: 기존 맵 → 스키마 색상 → 기본값
  const schema = details.type === 'generic' ? getSchema(details.schemaId) : undefined;
  const accent = CATEGORY_ACCENT[pr.category]
    || (schema ? getAccent(schema.color) : 'border-l-blue-500');

  // 동적 카테고리 라벨
  const categoryLabel = CATEGORY_LABELS_FALLBACK[pr.category] || schema?.label || pr.category;

  return (
    <div className={`max-w-[400px] border border-border rounded-xl bg-white overflow-hidden border-l-4 ${accent} shadow-sm`}>
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-2">
        <span className="text-sm font-bold text-foreground">
          {categoryLabel}
        </span>
        <span className="text-xs text-muted-foreground">구매요청 요약</span>
      </div>

      {/* 데이터 그리드 */}
      <div className="px-5 pb-4 space-y-2.5">
        {details.type === 'general' && (
          <>
            <Row label="품목명" value={details.itemName} />
            <Row label="수량" value={`${details.quantity}개`} />
            <Row label="희망 납품일" value={details.desiredDeliveryDate} />
            <Row label="예산" value={formatKRW(details.budget)} highlight />
            <Row label="구매 사유" value={details.reason} />
          </>
        )}

        {details.type === 'it_asset' && (
          <>
            <Row label="장비 종류" value={details.equipmentType} />
            <Row label="사양" value={details.specs} />
            <Row label="수량" value={`${details.quantity}대`} />
            <Row label="사용자" value={details.user} />
            <Row label="부서" value={details.department} />
          </>
        )}

        {details.type === 'mro' && (
          <>
            <Row label="소모품명" value={details.consumableName} />
            <Row label="수량" value={`${details.quantity}개`} />
            <Row label="긴급도" value={URGENCY_LABELS[details.urgency]} />
            <Row label="배송지" value={details.deliveryAddress} />
          </>
        )}

        {details.type === 'generic' && schema && (
          <>
            {schema.fields
              .filter((f) => f.required && details.fields[f.key] !== undefined)
              .map((f) => (
                <Row
                  key={f.key}
                  label={f.label}
                  value={String(details.fields[f.key])}
                  highlight={f.key === 'budget' || f.key === 'totalAmount'}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 text-[13px]">
      <span className="text-muted-foreground w-[80px] shrink-0">{label}</span>
      <span className={highlight ? 'font-semibold text-blue-600' : 'font-medium text-foreground'}>{value}</span>
    </div>
  );
}
