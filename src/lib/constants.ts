import type { PRStatus, Urgency } from '@/types';

export const STATUS_LABELS: Record<PRStatus, string> = {
  pending: '대기중',
  in_review: '승인중',
  approved: '승인완료',
  rejected: '반려',
};

export const CATEGORY_LABELS: Record<string, string> = {
  general: '일반 구매',
  it_asset: 'IT 자산',
  mro: 'MRO/소모품',
};

export const STATUS_COLORS: Record<PRStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  in_review: { bg: 'bg-blue-100', text: 'text-blue-800' },
  approved: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: 'bg-purple-100', text: 'text-purple-800' },
  it_asset: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  mro: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: '여유 (1-2주)',
  medium: '보통 (3-5일)',
  high: '긴급 (1-2일)',
};

export const DEPARTMENTS = ['경영지원팀', '개발팀', '마케팅팀', '인사팀', '재무팀'];

// 구매담당자 업무 카테고리
export const PROCUREMENT_CATEGORY_LABELS: Record<string, string> = {
  pr_approval: '구매요청 승인',
  bidding: '입찰/견적',
  contract: '계약 관리',
  po_delivery: '발주/납품',
  vendor: '협력사 관리',
};

export const PROCUREMENT_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; border: string; icon: string }> = {
  pr_approval: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-l-amber-400', icon: '📝' },
  bidding: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-l-blue-400', icon: '📊' },
  contract: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400', border: 'border-l-violet-400', icon: '📄' },
  po_delivery: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400', border: 'border-l-green-400', icon: '📦' },
  vendor: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-l-red-400', icon: '🏢' },
};

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}
