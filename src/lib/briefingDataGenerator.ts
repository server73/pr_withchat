import type { PurchaseRequest, ProcurementTask } from '@/types';
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS, formatKRW } from './constants';

// ========== 구매담당자 업무 Mock 데이터 ==========

const PROCUREMENT_TASK_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  pr_approval: { label: '구매요청 승인', icon: 'FileText', color: 'amber' },
  bidding: { label: '입찰/견적', icon: 'Clock', color: 'blue' },
  contract: { label: '계약 관리', icon: 'FileText', color: 'violet' },
  po_delivery: { label: '발주/납품', icon: 'Package', color: 'green' },
  vendor: { label: '협력사 관리', icon: 'Monitor', color: 'red' },
};

// 구매요청 승인 외의 구매담당자 업무 mock 데이터
const MOCK_PROCUREMENT_TASKS: ProcurementTask[] = [
  // 입찰/견적
  {
    id: 'BID-001',
    category: 'bidding',
    title: '서버 장비 입찰 마감 임박',
    description: '3개 업체 견적 비교 필요 — 마감 D-2',
    urgency: 'high',
    amount: 15000000,
    dueDate: '2025-02-09',
    vendor: '한국IT솔루션 외 2곳',
  },
  {
    id: 'BID-002',
    category: 'bidding',
    title: '사무가구 견적 요청 발송',
    description: '스탠딩 데스크 6대 — 견적서 3곳 대기 중',
    urgency: 'medium',
    amount: 3600000,
    dueDate: '2025-02-14',
    relatedPrId: 'PR-2025-003',
  },

  // 계약 관리
  {
    id: 'CTR-001',
    category: 'contract',
    title: '복합기 유지보수 계약 갱신',
    description: '(주)오피스프로 — 계약 만료 D-7',
    urgency: 'high',
    dueDate: '2025-02-14',
    vendor: '(주)오피스프로',
    amount: 12000000,
  },
  {
    id: 'CTR-002',
    category: 'contract',
    title: 'IT 장비 연간 단가 계약 검토',
    description: '델/레노버 노트북 단가 계약서 검토 대기',
    urgency: 'medium',
    vendor: 'Dell Korea / Lenovo',
    amount: 50000000,
  },

  // 발주/납품
  {
    id: 'PO-001',
    category: 'po_delivery',
    title: '외장 모니터 발주 확인',
    description: 'LG전자 — 8대 발주 완료, 납품 예정 2/12',
    urgency: 'low',
    amount: 4800000,
    dueDate: '2025-02-12',
    relatedPrId: 'PR-2025-007',
    vendor: 'LG전자',
  },
  {
    id: 'PO-002',
    category: 'po_delivery',
    title: '복사용지 입고 검수 필요',
    description: '한솔제지 — 20박스 도착, 검수 대기',
    urgency: 'medium',
    amount: 120000,
    relatedPrId: 'PR-2025-011',
    vendor: '한솔제지',
  },

  // 협력사 관리
  {
    id: 'VND-001',
    category: 'vendor',
    title: '신규 협력사 등록 심사',
    description: '(주)테크서플라이 — 서류 심사 진행 중',
    urgency: 'medium',
    vendor: '(주)테크서플라이',
  },
  {
    id: 'VND-002',
    category: 'vendor',
    title: '협력사 평가 마감 임박',
    description: '2024년 하반기 협력사 실적 평가 — D-3',
    urgency: 'high',
    dueDate: '2025-02-10',
  },
];

export { PROCUREMENT_TASK_CATEGORIES };

// ========== 유틸리티 ==========

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}

// PR 데이터에서 승인 대기 태스크 생성
function prToApprovalTask(pr: PurchaseRequest): ProcurementTask {
  const urgency = pr.details.type === 'mro' && pr.details.urgency === 'high' ? 'high' : 'medium';
  return {
    id: `PRA-${pr.id}`,
    category: 'pr_approval',
    title: pr.title,
    description: `${pr.requester} (${pr.department}) — ${formatKRW(pr.totalAmount)}`,
    urgency: urgency as 'high' | 'medium' | 'low',
    amount: pr.totalAmount,
    requester: pr.requester,
    department: pr.department,
    relatedPrId: pr.id,
  };
}

// 전체 브리핑 태스크 생성
export function generateAllProcurementTasks(purchaseRequests: PurchaseRequest[]): ProcurementTask[] {
  const prApprovals = purchaseRequests
    .filter((pr) => pr.status === 'pending')
    .map(prToApprovalTask);

  return [...prApprovals, ...MOCK_PROCUREMENT_TASKS];
}

// 카테고리별 그룹핑
export function groupTasksByCategory(tasks: ProcurementTask[]): { category: string; label: string; icon: string; color: string; tasks: ProcurementTask[] }[] {
  const groups: Record<string, ProcurementTask[]> = {};

  for (const task of tasks) {
    if (!groups[task.category]) groups[task.category] = [];
    groups[task.category].push(task);
  }

  // 긴급한 것 먼저, 카테고리 순서 유지
  const order = ['pr_approval', 'bidding', 'contract', 'po_delivery', 'vendor'];
  return order
    .filter((cat) => groups[cat]?.length > 0)
    .map((cat) => ({
      category: cat,
      ...PROCUREMENT_TASK_CATEGORIES[cat],
      tasks: groups[cat].sort((a, b) => {
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }),
    }));
}

// 브리핑 인사 메시지 생성
export function formatBriefingGreeting(
  userName: string,
  tasks: ProcurementTask[],
): string {
  const greeting = getTimeGreeting();
  const urgentCount = tasks.filter((t) => t.urgency === 'high').length;
  const totalCount = tasks.length;
  const totalAmount = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);

  const lines: string[] = [];
  lines.push(`${userName} 프로님, ${greeting}. ☀️`);
  lines.push(`오늘의 구매 업무 현황을 브리핑 드리겠습니다.`);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📋 오늘의 업무 요약');
  lines.push(`총 ${totalCount}건의 업무가 대기 중이며, 처리 예상 금액은 ${formatKRW(totalAmount)}입니다.`);

  // 긴급 건 하이라이트
  if (urgentCount > 0) {
    const urgentTasks = tasks.filter((t) => t.urgency === 'high');
    const urgentSummary = urgentTasks.map((t) => {
      if (t.dueDate) return `${t.title}(${t.dueDate})`;
      return t.title;
    }).join(', ');
    lines.push('');
    lines.push(`🔥 긴급 처리 필요 — ${urgentCount}건`);
    lines.push(urgentSummary);
    lines.push('즉시 확인이 필요합니다.');
  }

  // 카테고리별 요약 (금액 포함)
  lines.push('');
  const grouped = groupTasksByCategory(tasks);
  const catIcons: Record<string, string> = {
    pr_approval: '📝', bidding: '📊', contract: '📄', po_delivery: '📦', vendor: '🏢',
  };
  for (const group of grouped) {
    const icon = catIcons[group.category] || '📋';
    const groupAmount = group.tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const amountStr = groupAmount > 0 ? `  |  ${formatKRW(groupAmount)}` : '';
    lines.push(`${icon} ${group.label} — ${group.tasks.length}건${amountStr}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('긴급 건부터 우선순위로 정리해 드렸어요.');

  return lines.join('\n');
}

// 업무 목록 안내 메시지 (카테고리별 그룹 포함)
export function formatTaskListIntro(tasks: ProcurementTask[]): string {
  const urgentTasks = tasks.filter((t) => t.urgency === 'high');
  const normalTasks = tasks.filter((t) => t.urgency !== 'high');

  const lines: string[] = [];

  if (urgentTasks.length > 0) {
    lines.push(`🔥 긴급 업무 ${urgentTasks.length}건을 상단에 배치했습니다.`);
    lines.push('각 항목을 클릭하시면 상세 내용과 처리 옵션을 확인하실 수 있어요.');
  } else {
    lines.push('현재 긴급 건은 없습니다.');
    lines.push('각 업무를 클릭하시면 상세 내용을 확인하실 수 있어요.');
  }

  if (normalTasks.length > 0) {
    const upcomingDeadlines = normalTasks
      .filter((t) => t.dueDate)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    if (upcomingDeadlines.length > 0) {
      lines.push('');
      lines.push(`📅 가장 가까운 마감: ${upcomingDeadlines[0].title} (${upcomingDeadlines[0].dueDate})`);
    }
  }

  return lines.join('\n');
}

// 카테고리별 안내 코멘트 생성
function getCategoryAdvice(task: ProcurementTask): string[] {
  const lines: string[] = [];

  switch (task.category) {
    case 'pr_approval':
      if (task.urgency === 'high') {
        lines.push('⚡ 긴급 구매요청입니다. 현업 부서에서 빠른 처리를 요청하고 있어요.');
      }
      lines.push('💡 승인 시 자동으로 다음 결재 단계로 이관됩니다.');
      break;
    case 'bidding':
      if (task.urgency === 'high') {
        lines.push('⚡ 입찰 마감이 임박했습니다. 견적서 비교 후 빠른 의사결정이 필요해요.');
      }
      lines.push('💡 견적 비교표를 대시보드에서 상세 확인하실 수 있습니다.');
      break;
    case 'contract':
      if (task.urgency === 'high') {
        lines.push('⚡ 계약 만료가 가까워지고 있어요. 갱신 여부를 빠르게 결정해주세요.');
      }
      lines.push('💡 계약 조건 변경 시 법무팀 검토가 필요할 수 있습니다.');
      break;
    case 'po_delivery':
      if (task.urgency === 'high') {
        lines.push('⚡ 긴급 납품 건입니다. 입고 확인 후 즉시 검수를 진행해주세요.');
      } else {
        lines.push('💡 납품 완료 후 검수 결과를 시스템에 등록해주세요.');
      }
      break;
    case 'vendor':
      if (task.urgency === 'high') {
        lines.push('⚡ 마감이 임박한 협력사 관리 업무입니다.');
      }
      lines.push('💡 협력사 평가 결과는 향후 입찰 참여 자격에 반영됩니다.');
      break;
  }

  return lines;
}

// 태스크 상세 텍스트 생성
export function getTaskDetailText(
  task: ProcurementTask,
  purchaseRequests: PurchaseRequest[],
): string {
  const lines: string[] = [];
  const catInfo = PROCUREMENT_TASK_CATEGORIES[task.category];
  const urgencyLabels: Record<string, string> = { high: '🔴 긴급', medium: '🟡 보통', low: '🟢 여유' };

  lines.push(`📌 ${task.title}`);
  lines.push('');

  // 기본 정보 테이블
  lines.push(`분류: ${catInfo?.label || task.category}`);
  lines.push(`긴급도: ${urgencyLabels[task.urgency]}`);
  if (task.requester) lines.push(`요청자: ${task.requester}${task.department ? ` (${task.department})` : ''}`);
  if (task.vendor) lines.push(`거래처: ${task.vendor}`);
  if (task.amount) lines.push(`금액: ${formatKRW(task.amount)}`);
  if (task.dueDate) lines.push(`처리 기한: ${task.dueDate}`);

  // 관련 PR 상세 정보
  if (task.relatedPrId) {
    const pr = purchaseRequests.find((p) => p.id === task.relatedPrId);
    if (pr) {
      lines.push('');
      lines.push(`── 관련 구매요청 (${pr.id}) ──`);
      lines.push(`상태: ${STATUS_LABELS[pr.status]}  |  분류: ${CATEGORY_LABELS[pr.category] || pr.category}`);

      const d = pr.details;
      if (d.type === 'general') {
        lines.push(`품목: ${d.itemName} × ${d.quantity}개`);
        lines.push(`사유: ${d.reason}`);
      } else if (d.type === 'it_asset') {
        lines.push(`장비: ${d.equipmentType} (${d.specs})`);
        lines.push(`수량: ${d.quantity}대  |  사용자: ${d.user}`);
      } else if (d.type === 'mro') {
        lines.push(`품목: ${d.consumableName} × ${d.quantity}개`);
        lines.push(`긴급도: ${URGENCY_LABELS[d.urgency]}  |  배송지: ${d.deliveryAddress}`);
      }
    }
  }

  // 카테고리별 맥락 코멘트
  const advice = getCategoryAdvice(task);
  if (advice.length > 0) {
    lines.push('');
    lines.push(...advice);
  }

  lines.push('');
  lines.push('어떻게 처리하시겠어요?');
  return lines.join('\n');
}

// 승인 완료 메시지 생성
export function formatApprovalConfirmation(prId: string, task: ProcurementTask): string {
  const lines: string[] = [];
  lines.push(`✅ ${prId} 구매요청이 승인 처리되었습니다.`);
  lines.push('');
  if (task.requester) {
    lines.push(`${task.requester}님에게 승인 알림이 발송되었으며, 다음 결재 단계로 자동 이관됩니다.`);
  }
  lines.push('');
  lines.push('다른 업무를 계속 확인하시겠어요?');
  return lines.join('\n');
}

// 목록 복귀 메시지 생성
export function formatBackToListMessage(tasks: ProcurementTask[]): string {
  const remaining = tasks.length;
  const urgentRemaining = tasks.filter((t) => t.urgency === 'high').length;
  const lines: string[] = [];

  lines.push(`📋 남은 업무 ${remaining}건입니다.`);
  if (urgentRemaining > 0) {
    lines.push(`그 중 긴급 건이 ${urgentRemaining}건 남아 있어요. 우선 처리를 권장드립니다.`);
  } else {
    lines.push('긴급 건은 모두 처리되었습니다. 나머지 업무를 여유있게 진행하세요.');
  }

  return lines.join('\n');
}
