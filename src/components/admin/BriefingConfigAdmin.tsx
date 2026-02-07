'use client';

import { useState, useMemo } from 'react';
import { useBriefingConfig } from '@/lib/briefingConfigContext';
import type { BriefingRoleId, BriefingItem, BriefingTaskTemplate } from '@/types';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';
import BriefingTaskTemplateRow from './BriefingTaskTemplateRow';

const ICON_OPTIONS = ['FileText', 'Clock', 'Package', 'Monitor', 'Wrench', 'Box', 'Truck', 'Shield', 'User', 'Briefcase'];
const COLOR_OPTIONS = ['amber', 'blue', 'violet', 'green', 'red', 'gray', 'orange', 'cyan'];

const COLOR_PREVIEW: Record<string, string> = {
  amber: 'bg-amber-400',
  blue: 'bg-blue-400',
  violet: 'bg-violet-400',
  green: 'bg-green-400',
  red: 'bg-red-400',
  gray: 'bg-gray-400',
  orange: 'bg-orange-400',
  cyan: 'bg-cyan-400',
};

export default function BriefingConfigAdmin() {
  const {
    agents,
    roles,
    items,
    taskTemplates,
    getItemsForRole,
    updateItem,
    reorderItems,
    addTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
  } = useBriefingConfig();

  const sortedRoles = useMemo(() => [...roles].sort((a, b) => a.sortOrder - b.sortOrder), [roles]);

  const [activeRoleId, setActiveRoleId] = useState<BriefingRoleId>(sortedRoles[0]?.id || 'requester');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrgency, setNewUrgency] = useState<'high' | 'medium' | 'low'>('medium');

  const activeRole = sortedRoles.find((r) => r.id === activeRoleId);
  const roleItems = useMemo(() => getItemsForRole(activeRoleId), [getItemsForRole, activeRoleId]);
  const selectedItem = useMemo(() => items.find((i) => i.id === selectedItemId), [items, selectedItemId]);
  const itemTemplates = useMemo(
    () => (selectedItemId ? taskTemplates.filter((t) => t.itemId === selectedItemId) : []),
    [taskTemplates, selectedItemId],
  );

  // Auto-select first item when role changes
  const handleRoleChange = (roleId: BriefingRoleId) => {
    setActiveRoleId(roleId);
    setEditingMeta(false);
    setShowNewTemplate(false);
    const firstItem = getItemsForRole(roleId);
    setSelectedItemId(firstItem.length > 0 ? firstItem[0].id : null);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setEditingMeta(false);
    setShowNewTemplate(false);
  };

  const handleMoveUp = (idx: number) => {
    if (idx > 0) reorderItems(activeRoleId, idx, idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx < roleItems.length - 1) reorderItems(activeRoleId, idx, idx + 1);
  };

  const handleAddTemplate = () => {
    if (!newTitle || !selectedItemId) return;
    const id = `TPL-${Date.now()}`;
    const template: BriefingTaskTemplate = {
      id,
      itemId: selectedItemId,
      title: newTitle,
      description: newDesc || newTitle,
      urgency: newUrgency,
      enabled: true,
    };
    addTaskTemplate(template);
    setNewTitle('');
    setNewDesc('');
    setNewUrgency('medium');
    setShowNewTemplate(false);
  };

  return (
    <div className="space-y-6">
      {/* 상단: 역할 서브탭 */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {sortedRoles.map((role) => {
            const RoleIcon = getIcon(role.icon);
            const isActive = role.id === activeRoleId;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-blue-700 bg-blue-50/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-50',
                )}
              >
                <RoleIcon className="w-4 h-4" />
                {role.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>
        {activeRole && (
          <div className="px-4 py-2.5 bg-gray-50/50">
            <p className="text-xs text-muted-foreground">{activeRole.description}</p>
          </div>
        )}
      </div>

      {/* 메인 영역: 좌측 아이템 목록 + 우측 편집 패널 */}
      <div className="flex gap-6">
        {/* 좌측: 항목 목록 */}
        <div className="w-[240px] shrink-0">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                브리핑 항목
              </p>
            </div>
            <div className="p-2 space-y-1">
              {roleItems.map((item, idx) => {
                const Icon = getIcon(item.icon);
                const isSelected = item.id === selectedItemId;
                const templateCount = taskTemplates.filter((t) => t.itemId === item.id).length;
                return (
                  <div key={item.id} className="flex items-center gap-1">
                    <button
                      onClick={() => handleItemSelect(item.id)}
                      className={cn(
                        'flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                        isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-foreground',
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', isSelected && 'text-blue-700')}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {templateCount}개 템플릿
                          {!item.enabled && ' · 비활성'}
                        </p>
                      </div>
                    </button>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        className="p-0.5 hover:bg-gray-100 rounded text-muted-foreground"
                        disabled={idx === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        className="p-0.5 hover:bg-gray-100 rounded text-muted-foreground"
                        disabled={idx === roleItems.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {roleItems.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  이 역할에 등록된 항목이 없습니다.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-border">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              항목을 활성/비활성하면 브리핑에 해당 업무가 노출되거나 숨겨집니다.
              태스크 템플릿을 추가하여 브리핑 내용을 커스터마이즈할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 우측: 항목 상세 편집 */}
        <div className="flex-1 min-w-0">
          {selectedItem ? (
            <div className="space-y-6">
              {/* 항목 메타 정보 */}
              <div className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{selectedItem.label}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(selectedItem.id, { enabled: !selectedItem.enabled })}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors',
                        selectedItem.enabled
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      )}
                    >
                      {selectedItem.enabled ? '활성' : '비활성'}
                    </button>
                    {!editingMeta && (
                      <button
                        onClick={() => setEditingMeta(true)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-gray-50 transition-colors"
                      >
                        편집
                      </button>
                    )}
                  </div>
                </div>

                {editingMeta ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">라벨</label>
                        <input
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                          value={selectedItem.label}
                          onChange={(e) => updateItem(selectedItem.id, { label: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">설명</label>
                        <input
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                          value={selectedItem.description}
                          onChange={(e) => updateItem(selectedItem.id, { description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">아이콘</label>
                        <select
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                          value={selectedItem.icon}
                          onChange={(e) => updateItem(selectedItem.id, { icon: e.target.value })}
                        >
                          {ICON_OPTIONS.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">색상</label>
                        <div className="flex items-center gap-2">
                          <select
                            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-white"
                            value={selectedItem.color}
                            onChange={(e) => updateItem(selectedItem.id, { color: e.target.value })}
                          >
                            {COLOR_OPTIONS.map((color) => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                          <div className={cn('w-6 h-6 rounded-full', COLOR_PREVIEW[selectedItem.color] || 'bg-gray-400')} />
                        </div>
                      </div>
                    </div>

                    {/* Agent 선택 */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">에이전트</label>
                      <select
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        value={selectedItem.agentId || ''}
                        onChange={(e) => updateItem(selectedItem.id, { agentId: e.target.value || undefined })}
                      >
                        <option value="">미지정</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} — {agent.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Detail URL Template */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">상세 URL 템플릿</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        value={selectedItem.detailUrlTemplate || ''}
                        onChange={(e) => updateItem(selectedItem.id, { detailUrlTemplate: e.target.value || undefined })}
                        placeholder="/procurement/pr/{taskId}"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        사용 가능한 변수: {'{taskId}'}, {'{prId}'}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setEditingMeta(false)}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{selectedItem.description}</p>
                    <p className="text-xs">
                      아이콘: {selectedItem.icon} · 색상: {selectedItem.color} · ID: {selectedItem.id}
                    </p>
                    {selectedItem.agentId && (
                      <p className="text-xs">
                        에이전트: {agents.find((a) => a.id === selectedItem.agentId)?.name || selectedItem.agentId}
                      </p>
                    )}
                    {selectedItem.detailUrlTemplate && (
                      <p className="text-xs">
                        URL 템플릿: {selectedItem.detailUrlTemplate}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 태스크 템플릿 목록 */}
              <div className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">
                    태스크 템플릿
                    <span className="text-sm font-normal text-muted-foreground ml-2">{itemTemplates.length}개</span>
                  </h3>
                  <button
                    onClick={() => setShowNewTemplate(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    템플릿 추가
                  </button>
                </div>

                {selectedItemId === 'pr_approval' && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      구매요청 승인 카테고리는 실제 PR 데이터(pending 상태)에서 자동으로 태스크가 생성됩니다.
                      아래 템플릿은 추가 업무 항목으로 함께 표시됩니다.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {itemTemplates.map((tmpl) => (
                    <BriefingTaskTemplateRow
                      key={tmpl.id}
                      template={tmpl}
                      onUpdate={updateTaskTemplate}
                      onDelete={deleteTaskTemplate}
                    />
                  ))}

                  {itemTemplates.length === 0 && !showNewTemplate && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      이 항목에 등록된 태스크 템플릿이 없습니다.
                    </div>
                  )}

                  {showNewTemplate && (
                    <div className="border border-blue-200 rounded-xl bg-blue-50/50 p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">제목</label>
                          <input
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="태스크 제목"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">긴급도</label>
                          <select
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                            value={newUrgency}
                            onChange={(e) => setNewUrgency(e.target.value as 'high' | 'medium' | 'low')}
                          >
                            <option value="high">긴급</option>
                            <option value="medium">보통</option>
                            <option value="low">여유</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">설명</label>
                        <input
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="태스크 설명"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setShowNewTemplate(false); setNewTitle(''); setNewDesc(''); }}
                          className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleAddTemplate}
                          disabled={!newTitle}
                          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                        >
                          추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border py-20 text-center">
              <p className="text-muted-foreground text-sm">좌측에서 브리핑 항목을 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
