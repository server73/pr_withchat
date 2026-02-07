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

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}
