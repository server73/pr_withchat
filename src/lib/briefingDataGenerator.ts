import type { PurchaseRequest, ProcurementTask, BriefingItem, BriefingTaskTemplate, UserBriefingPrefs, UserItemPref } from '@/types';
import { STATUS_LABELS, CATEGORY_LABELS, URGENCY_LABELS, formatKRW } from './constants';

// ========== 유틸리티 ==========

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}

// 상세 URL 템플릿 resolve
export function resolveDetailUrl(template: string, task: ProcurementTask): string {
  return template
    .replace('{taskId}', task.id)
    .replace('{prId}', task.relatedPrId || '');
}

// PR 데이터에서 승인 대기 태스크 생성
function prToApprovalTask(pr: PurchaseRequest, item: BriefingItem): ProcurementTask {
  const urgency = pr.details.type === 'mro' && pr.details.urgency === 'high' ? 'high' : 'medium';
  const taskId = `PRA-${pr.id}`;
  const detailUrl = item.detailUrlTemplate
    ? item.detailUrlTemplate.replace('{taskId}', taskId).replace('{prId}', pr.id)
    : undefined;
  return {
    id: taskId,
    itemId: 'pr_approval',
    title: pr.title,
    description: `${pr.requester} (${pr.department}) — ${formatKRW(pr.totalAmount)}`,
    urgency: urgency as 'high' | 'medium' | 'low',
    amount: pr.totalAmount,
    requester: pr.requester,
    department: pr.department,
    relatedPrId: pr.id,
    detailUrl,
  };
}

// 템플릿을 ProcurementTask로 변환
function templateToTask(t: BriefingTaskTemplate, items: BriefingItem[]): ProcurementTask {
  const item = items.find((i) => i.id === t.itemId);
  const urlTemplate = t.detailUrlOverride || item?.detailUrlTemplate;
  const task: ProcurementTask = {
    id: t.id,
    itemId: t.itemId,
    title: t.title,
    description: t.description,
    urgency: t.urgency,
    amount: t.amount,
    dueDate: t.dueDate,
    requester: t.requester,
    department: t.department,
    vendor: t.vendor,
  };
  if (urlTemplate) {
    task.detailUrl = resolveDetailUrl(urlTemplate, task);
  }
  return task;
}

// 전체 브리핑 태스크 생성 (config + prefs 기반)
export function generateAllProcurementTasks(
  purchaseRequests: PurchaseRequest[],
  enabledItems: BriefingItem[],
  enabledTemplates: BriefingTaskTemplate[],
  prefs: UserBriefingPrefs,
): ProcurementTask[] {
  const enabledItemIds = new Set(enabledItems.map((i) => i.id));
  const visibleItemIds = new Set(
    prefs.itemPrefs.filter((ip) => ip.visible && enabledItemIds.has(ip.itemId)).map((ip) => ip.itemId),
  );

  // 1. 템플릿 → 태스크 변환 (활성 항목 + 사용자 visible만)
  const templateTasks = enabledTemplates
    .filter((t) => visibleItemIds.has(t.itemId))
    .map((t) => templateToTask(t, enabledItems));

  // 2. PR pending → pr_approval 태스크 (해당 항목이 활성+visible일 때만)
  const prApprovalItem = enabledItems.find((i) => i.id === 'pr_approval');
  const prApprovals = visibleItemIds.has('pr_approval') && prApprovalItem
    ? purchaseRequests.filter((pr) => pr.status === 'pending').map((pr) => prToApprovalTask(pr, prApprovalItem))
    : [];

  let allTasks = [...prApprovals, ...templateTasks];

  // 3. 긴급도 필터 적용
  if (prefs.urgencyFilter === 'high_only') {
    allTasks = allTasks.filter((t) => t.urgency === 'high');
  } else if (prefs.urgencyFilter === 'medium_up') {
    allTasks = allTasks.filter((t) => t.urgency === 'high' || t.urgency === 'medium');
  }

  // 4. 사용자 항목 정렬 적용
  const itemSortMap = new Map(prefs.itemPrefs.map((ip) => [ip.itemId, ip.sortOrder]));
  const urgencyOrder = { high: 0, medium: 1, low: 2 };

  allTasks.sort((a, b) => {
    const itemA = itemSortMap.get(a.itemId) ?? 99;
    const itemB = itemSortMap.get(b.itemId) ?? 99;
    if (itemA !== itemB) return itemA - itemB;
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  // 5. 항목당 최대 건수 제한
  if (prefs.maxTasksPerItem > 0) {
    const countMap: Record<string, number> = {};
    allTasks = allTasks.filter((t) => {
      countMap[t.itemId] = (countMap[t.itemId] || 0) + 1;
      return countMap[t.itemId] <= prefs.maxTasksPerItem;
    });
  }

  return allTasks;
}

// 항목별 그룹핑 (config 기반 메타데이터)
export function groupTasksByItem(
  tasks: ProcurementTask[],
  items: BriefingItem[],
  userItemPrefs: UserItemPref[],
): { itemId: string; label: string; icon: string; color: string; tasks: ProcurementTask[] }[] {
  const groups: Record<string, ProcurementTask[]> = {};
  for (const task of tasks) {
    if (!groups[task.itemId]) groups[task.itemId] = [];
    groups[task.itemId].push(task);
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const itemSortMap = new Map(userItemPrefs.map((ip) => [ip.itemId, ip.sortOrder]));

  const urgencyOrder = { high: 0, medium: 1, low: 2 };

  return Object.keys(groups)
    .sort((a, b) => (itemSortMap.get(a) ?? 99) - (itemSortMap.get(b) ?? 99))
    .map((itemId) => {
      const config = itemMap.get(itemId);
      return {
        itemId,
        label: config?.label || itemId,
        icon: config?.icon || 'FileText',
        color: config?.color || 'gray',
        tasks: groups[itemId].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]),
      };
    });
}

// 브리핑 인사 메시지 생성
export function formatBriefingGreeting(
  userName: string,
  tasks: ProcurementTask[],
  items?: BriefingItem[],
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

  // 항목별 요약
  lines.push('');
  const itemMap = items ? new Map(items.map((i) => [i.id, i])) : null;

  const grouped: Record<string, ProcurementTask[]> = {};
  for (const task of tasks) {
    if (!grouped[task.itemId]) grouped[task.itemId] = [];
    grouped[task.itemId].push(task);
  }

  for (const [itemId, itemTasks] of Object.entries(grouped)) {
    const item = itemMap?.get(itemId);
    const label = item?.label || itemId;
    const groupAmount = itemTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const amountStr = groupAmount > 0 ? `  |  ${formatKRW(groupAmount)}` : '';
    lines.push(`📋 ${label} — ${itemTasks.length}건${amountStr}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('긴급 건부터 우선순위로 정리해 드렸어요.');

  return lines.join('\n');
}

// 업무 목록 안내 메시지
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

// 항목별 안내 코멘트 생성
function getItemAdvice(task: ProcurementTask): string[] {
  const lines: string[] = [];
  const id = task.itemId;

  if (id === 'pr_approval' || id === 'my_approvals') {
    if (task.urgency === 'high') {
      lines.push('⚡ 긴급 구매요청입니다. 현업 부서에서 빠른 처리를 요청하고 있어요.');
    }
    lines.push('💡 승인 시 자동으로 다음 결재 단계로 이관됩니다.');
  } else if (id === 'bidding') {
    if (task.urgency === 'high') {
      lines.push('⚡ 입찰 마감이 임박했습니다. 견적서 비교 후 빠른 의사결정이 필요해요.');
    }
    lines.push('💡 견적 비교표를 대시보드에서 상세 확인하실 수 있습니다.');
  } else if (id === 'contract') {
    if (task.urgency === 'high') {
      lines.push('⚡ 계약 만료가 가까워지고 있어요. 갱신 여부를 빠르게 결정해주세요.');
    }
    lines.push('💡 계약 조건 변경 시 법무팀 검토가 필요할 수 있습니다.');
  } else if (id === 'po_delivery') {
    if (task.urgency === 'high') {
      lines.push('⚡ 긴급 납품 건입니다. 입고 확인 후 즉시 검수를 진행해주세요.');
    } else {
      lines.push('💡 납품 완료 후 검수 결과를 시스템에 등록해주세요.');
    }
  } else if (id === 'vendor') {
    if (task.urgency === 'high') {
      lines.push('⚡ 마감이 임박한 협력사 관리 업무입니다.');
    }
    lines.push('💡 협력사 평가 결과는 향후 입찰 참여 자격에 반영됩니다.');
  } else if (id === 'overdue_monitor') {
    lines.push('⚡ 처리 기한이 초과된 건입니다. 담당자에게 독촉이 필요할 수 있습니다.');
  } else if (id === 'compliance_check') {
    lines.push('⚠️ 규정 위반 가능성이 있는 건입니다. 상세 내역을 확인해주세요.');
  } else if (id === 'purchase_stats') {
    lines.push('📊 구매 통계 리포트입니다. 추이 분석을 참고해주세요.');
  } else {
    if (task.urgency === 'high') {
      lines.push('⚡ 긴급 처리가 필요한 업무입니다.');
    }
    lines.push('💡 상세 내용을 확인하고 적절한 조치를 취해주세요.');
  }

  return lines;
}

// 태스크 상세 텍스트 생성
export function getTaskDetailText(
  task: ProcurementTask,
  purchaseRequests: PurchaseRequest[],
  items?: BriefingItem[],
): string {
  const lines: string[] = [];
  const itemMap = items ? new Map(items.map((i) => [i.id, i])) : null;
  const itemLabel = itemMap?.get(task.itemId)?.label || task.itemId;
  const urgencyLabels: Record<string, string> = { high: '🔴 긴급', medium: '🟡 보통', low: '🟢 여유' };

  lines.push(`📌 ${task.title}`);
  lines.push('');
  lines.push(`분류: ${itemLabel}`);
  lines.push(`긴급도: ${urgencyLabels[task.urgency]}`);
  if (task.requester) lines.push(`요청자: ${task.requester}${task.department ? ` (${task.department})` : ''}`);
  if (task.vendor) lines.push(`거래처: ${task.vendor}`);
  if (task.amount) lines.push(`금액: ${formatKRW(task.amount)}`);
  if (task.dueDate) lines.push(`처리 기한: ${task.dueDate}`);
  if (task.detailUrl) lines.push(`🔗 상세보기: ${task.detailUrl}`);

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

  const advice = getItemAdvice(task);
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
