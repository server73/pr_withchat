'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { BriefingAgent, BriefingRole, BriefingRoleId, BriefingItem, BriefingTaskTemplate } from '@/types';

// ========== Mock 에이전트 레지스트리 (읽기 전용) ==========

const MOCK_AGENTS: BriefingAgent[] = [
  { id: 'agent-pr', name: '구매요청 처리 Agent', description: '구매요청 생성/수정/승인 지원', model: 'claude-sonnet-4-5' },
  { id: 'agent-approval', name: '승인 검토 Agent', description: '구매요청 승인/반려 검토 지원', model: 'claude-sonnet-4-5' },
  { id: 'agent-bidding', name: '입찰 분석 Agent', description: '입찰/견적 비교분석 지원', model: 'claude-sonnet-4-5' },
  { id: 'agent-contract', name: '계약 관리 Agent', description: '계약 체결/갱신/만료 관리', model: 'claude-sonnet-4-5' },
  { id: 'agent-delivery', name: '납품 검수 Agent', description: '발주/납품/검수 처리 지원', model: 'claude-sonnet-4-5' },
  { id: 'agent-vendor', name: '협력사 관리 Agent', description: '협력사 등록/평가/관리', model: 'claude-sonnet-4-5' },
  { id: 'agent-analytics', name: '구매 분석 Agent', description: '구매 통계/리포트 분석', model: 'claude-sonnet-4-5' },
  { id: 'agent-compliance', name: '규정 준수 Agent', description: '구매 규정 준수 모니터링', model: 'claude-sonnet-4-5' },
];

// ========== 기본 역할 ==========

const DEFAULT_ROLES: BriefingRole[] = [
  { id: 'requester', label: '구매요청자', description: '구매요청을 생성하고 진행상황을 확인', icon: 'User', sortOrder: 0 },
  { id: 'manager', label: '구매담당자', description: '구매요청 승인, 입찰, 계약, 발주 등 실무 처리', icon: 'Briefcase', sortOrder: 1 },
  { id: 'admin', label: '구매관리자', description: '구매 프로세스 전체 모니터링 및 관리', icon: 'Shield', sortOrder: 2 },
];

// ========== 기본 브리핑 항목 ==========

const DEFAULT_ITEMS: BriefingItem[] = [
  // 구매요청자
  { id: 'my_pr_status', roleId: 'requester', label: '내 요청 현황', icon: 'FileText', color: 'blue', description: '내가 생성한 구매요청 진행상황', agentId: 'agent-pr', detailUrlTemplate: '/procurement/pr/{taskId}', enabled: true, sortOrder: 0 },
  { id: 'my_approvals', roleId: 'requester', label: '승인 대기', icon: 'Clock', color: 'amber', description: '내 요청 중 승인 대기 건', agentId: 'agent-approval', detailUrlTemplate: '/procurement/approval/{taskId}', enabled: true, sortOrder: 1 },
  // 구매담당자 (기존 5개 카테고리 마이그레이션)
  { id: 'pr_approval', roleId: 'manager', label: '구매요청 승인', icon: 'FileText', color: 'amber', description: '구매요청 승인/반려 처리', agentId: 'agent-approval', detailUrlTemplate: '/procurement/pr/{taskId}', enabled: true, sortOrder: 0 },
  { id: 'bidding', roleId: 'manager', label: '입찰/견적', icon: 'Clock', color: 'blue', description: '입찰 및 견적 비교 업무', agentId: 'agent-bidding', detailUrlTemplate: '/procurement/bid/{taskId}', enabled: true, sortOrder: 1 },
  { id: 'contract', roleId: 'manager', label: '계약 관리', icon: 'FileText', color: 'violet', description: '계약 체결 및 갱신 관리', agentId: 'agent-contract', detailUrlTemplate: '/procurement/contract/{taskId}', enabled: true, sortOrder: 2 },
  { id: 'po_delivery', roleId: 'manager', label: '발주/납품', icon: 'Package', color: 'green', description: '발주 및 납품/검수 관리', agentId: 'agent-delivery', detailUrlTemplate: '/procurement/po/{taskId}', enabled: true, sortOrder: 3 },
  { id: 'vendor', roleId: 'manager', label: '협력사 관리', icon: 'Monitor', color: 'red', description: '협력사 등록 및 평가', agentId: 'agent-vendor', detailUrlTemplate: '/procurement/vendor/{taskId}', enabled: true, sortOrder: 4 },
  // 구매관리자
  { id: 'overdue_monitor', roleId: 'admin', label: '지연 모니터링', icon: 'Clock', color: 'red', description: '처리 기한 초과 건 모니터링', agentId: 'agent-analytics', detailUrlTemplate: '/procurement/overdue/{taskId}', enabled: true, sortOrder: 0 },
  { id: 'compliance_check', roleId: 'admin', label: '규정 준수', icon: 'Shield', color: 'violet', description: '구매 규정 준수 현황 점검', agentId: 'agent-compliance', detailUrlTemplate: '/procurement/compliance/{taskId}', enabled: true, sortOrder: 1 },
  { id: 'purchase_stats', roleId: 'admin', label: '구매 통계', icon: 'Monitor', color: 'cyan', description: '구매 실적 및 통계 분석', agentId: 'agent-analytics', detailUrlTemplate: '/procurement/stats/{taskId}', enabled: true, sortOrder: 2 },
];

// ========== 기본 태스크 템플릿 ==========

const DEFAULT_TEMPLATES: BriefingTaskTemplate[] = [
  // 구매요청자
  { id: 'REQ-001', itemId: 'my_pr_status', title: '노트북 구매요청 진행 중', description: '개발팀 노트북 5대 — 견적 비교 단계', urgency: 'medium', amount: 8500000, enabled: true },
  { id: 'REQ-002', itemId: 'my_approvals', title: '사무용품 구매요청 승인 대기', description: '경영지원팀 — 승인 대기 D-1', urgency: 'high', amount: 350000, dueDate: '2025-02-08', enabled: true },
  // 구매담당자 (기존)
  { id: 'BID-001', itemId: 'bidding', title: '서버 장비 입찰 마감 임박', description: '3개 업체 견적 비교 필요 — 마감 D-2', urgency: 'high', amount: 15000000, dueDate: '2025-02-09', vendor: '한국IT솔루션 외 2곳', enabled: true },
  { id: 'BID-002', itemId: 'bidding', title: '사무가구 견적 요청 발송', description: '스탠딩 데스크 6대 — 견적서 3곳 대기 중', urgency: 'medium', amount: 3600000, dueDate: '2025-02-14', enabled: true },
  { id: 'CTR-001', itemId: 'contract', title: '복합기 유지보수 계약 갱신', description: '(주)오피스프로 — 계약 만료 D-7', urgency: 'high', dueDate: '2025-02-14', vendor: '(주)오피스프로', amount: 12000000, enabled: true },
  { id: 'CTR-002', itemId: 'contract', title: 'IT 장비 연간 단가 계약 검토', description: '델/레노버 노트북 단가 계약서 검토 대기', urgency: 'medium', vendor: 'Dell Korea / Lenovo', amount: 50000000, enabled: true },
  { id: 'PO-001', itemId: 'po_delivery', title: '외장 모니터 발주 확인', description: 'LG전자 — 8대 발주 완료, 납품 예정 2/12', urgency: 'low', amount: 4800000, dueDate: '2025-02-12', vendor: 'LG전자', enabled: true },
  { id: 'PO-002', itemId: 'po_delivery', title: '복사용지 입고 검수 필요', description: '한솔제지 — 20박스 도착, 검수 대기', urgency: 'medium', amount: 120000, vendor: '한솔제지', enabled: true },
  { id: 'VND-001', itemId: 'vendor', title: '신규 협력사 등록 심사', description: '(주)테크서플라이 — 서류 심사 진행 중', urgency: 'medium', vendor: '(주)테크서플라이', enabled: true },
  { id: 'VND-002', itemId: 'vendor', title: '협력사 평가 마감 임박', description: '2024년 하반기 협력사 실적 평가 — D-3', urgency: 'high', dueDate: '2025-02-10', enabled: true },
  // 구매관리자
  { id: 'ADM-001', itemId: 'overdue_monitor', title: '계약 갱신 기한 초과 2건', description: '오피스프로 외 1건 — 처리 지연 중', urgency: 'high', dueDate: '2025-02-07', enabled: true },
  { id: 'ADM-002', itemId: 'compliance_check', title: '분할 발주 규정 위반 의심', description: '마케팅팀 소모품 발주 — 건당 한도 초과 가능', urgency: 'high', enabled: true },
  { id: 'ADM-003', itemId: 'purchase_stats', title: '1월 구매 실적 리포트', description: '월간 구매 금액 12.5억 — 전월 대비 8% 증가', urgency: 'low', amount: 1250000000, enabled: true },
];

// ========== Context ==========

interface BriefingConfigContextValue {
  agents: BriefingAgent[];
  roles: BriefingRole[];
  items: BriefingItem[];
  taskTemplates: BriefingTaskTemplate[];
  getItemsForRole: (roleId: BriefingRoleId) => BriefingItem[];
  getEnabledItems: (roleId: BriefingRoleId) => BriefingItem[];
  getEnabledTemplates: (roleId: BriefingRoleId) => BriefingTaskTemplate[];
  updateItem: (id: string, updates: Partial<BriefingItem>) => void;
  reorderItems: (roleId: BriefingRoleId, fromIndex: number, toIndex: number) => void;
  addTaskTemplate: (template: BriefingTaskTemplate) => void;
  updateTaskTemplate: (id: string, updates: Partial<BriefingTaskTemplate>) => void;
  deleteTaskTemplate: (id: string) => void;
}

const BriefingConfigContext = createContext<BriefingConfigContextValue | null>(null);

export function BriefingConfigProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BriefingItem[]>(DEFAULT_ITEMS);
  const [taskTemplates, setTaskTemplates] = useState<BriefingTaskTemplate[]>(DEFAULT_TEMPLATES);

  const getItemsForRole = useCallback(
    (roleId: BriefingRoleId) => items.filter((i) => i.roleId === roleId).sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );

  const getEnabledItems = useCallback(
    (roleId: BriefingRoleId) => items.filter((i) => i.roleId === roleId && i.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );

  const getEnabledTemplates = useCallback(
    (roleId: BriefingRoleId) => {
      const roleItemIds = new Set(items.filter((i) => i.roleId === roleId && i.enabled).map((i) => i.id));
      return taskTemplates.filter((t) => t.enabled && roleItemIds.has(t.itemId));
    },
    [items, taskTemplates],
  );

  const updateItem = useCallback((id: string, updates: Partial<BriefingItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const reorderItems = useCallback((roleId: BriefingRoleId, fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      const roleItems = prev.filter((i) => i.roleId === roleId).sort((a, b) => a.sortOrder - b.sortOrder);
      const otherItems = prev.filter((i) => i.roleId !== roleId);
      const [moved] = roleItems.splice(fromIndex, 1);
      roleItems.splice(toIndex, 0, moved);
      const reordered = roleItems.map((i, idx) => ({ ...i, sortOrder: idx }));
      return [...otherItems, ...reordered];
    });
  }, []);

  const addTaskTemplate = useCallback((template: BriefingTaskTemplate) => {
    setTaskTemplates((prev) => [...prev, template]);
  }, []);

  const updateTaskTemplate = useCallback((id: string, updates: Partial<BriefingTaskTemplate>) => {
    setTaskTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTaskTemplate = useCallback((id: string) => {
    setTaskTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <BriefingConfigContext.Provider
      value={{
        agents: MOCK_AGENTS,
        roles: DEFAULT_ROLES,
        items,
        taskTemplates,
        getItemsForRole,
        getEnabledItems,
        getEnabledTemplates,
        updateItem,
        reorderItems,
        addTaskTemplate,
        updateTaskTemplate,
        deleteTaskTemplate,
      }}
    >
      {children}
    </BriefingConfigContext.Provider>
  );
}

export function useBriefingConfig() {
  const ctx = useContext(BriefingConfigContext);
  if (!ctx) throw new Error('useBriefingConfig must be used inside BriefingConfigProvider');
  return ctx;
}
