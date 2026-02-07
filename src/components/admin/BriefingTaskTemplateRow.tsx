'use client';

import { useState } from 'react';
import type { BriefingTaskTemplate } from '@/types';
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatKRW } from '@/lib/constants';

const URGENCY_LABELS: Record<string, string> = { high: '긴급', medium: '보통', low: '여유' };
const URGENCY_COLORS: Record<string, string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-yellow-50 text-yellow-600',
  low: 'bg-green-50 text-green-600',
};

interface BriefingTaskTemplateRowProps {
  template: BriefingTaskTemplate;
  onUpdate: (id: string, updates: Partial<BriefingTaskTemplate>) => void;
  onDelete: (id: string) => void;
}

export default function BriefingTaskTemplateRow({ template, onUpdate, onDelete }: BriefingTaskTemplateRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BriefingTaskTemplate>(template);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onUpdate(template.id, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(template);
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(template.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  if (editing) {
    return (
      <div className="border border-blue-200 rounded-xl bg-blue-50/50 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">제목</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">긴급도</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.urgency}
              onChange={(e) => setDraft({ ...draft, urgency: e.target.value as 'high' | 'medium' | 'low' })}
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
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">금액 (원)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.amount ?? ''}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">처리 기한</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.dueDate ?? ''}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || undefined })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">거래처</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.vendor ?? ''}
              onChange={(e) => setDraft({ ...draft, vendor: e.target.value || undefined })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">요청자</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.requester ?? ''}
              onChange={(e) => setDraft({ ...draft, requester: e.target.value || undefined })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">부서</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.department ?? ''}
              onChange={(e) => setDraft({ ...draft, department: e.target.value || undefined })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">상세 URL 오버라이드</label>
          <input
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            placeholder="https://..."
            value={draft.detailUrlOverride ?? ''}
            onChange={(e) => setDraft({ ...draft, detailUrlOverride: e.target.value || undefined })}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleCancel} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50 transition-colors">
            <X className="w-4 h-4 inline mr-1" />취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Check className="w-4 h-4 inline mr-1" />저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl transition-colors ${template.enabled ? 'border-border bg-white hover:border-blue-200' : 'border-border/50 bg-gray-50 opacity-60'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{template.title}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${URGENCY_COLORS[template.urgency]}`}>
              {URGENCY_LABELS[template.urgency]}
            </span>
            {template.amount && (
              <span className="text-[11px] text-muted-foreground">{formatKRW(template.amount)}</span>
            )}
            {!template.enabled && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">비활성</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(template.id, { enabled: !template.enabled })}
            className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${
              template.enabled
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {template.enabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className={`p-1.5 rounded-lg transition-colors ${confirmDelete ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-muted-foreground hover:text-red-600'}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pt-3">
            <div className="col-span-2">
              <span className="text-muted-foreground">설명:</span>{' '}
              <span className="text-foreground">{template.description}</span>
            </div>
            {template.vendor && (
              <div>
                <span className="text-muted-foreground">거래처:</span>{' '}
                <span className="text-foreground">{template.vendor}</span>
              </div>
            )}
            {template.dueDate && (
              <div>
                <span className="text-muted-foreground">기한:</span>{' '}
                <span className="text-foreground">{template.dueDate}</span>
              </div>
            )}
            {template.requester && (
              <div>
                <span className="text-muted-foreground">요청자:</span>{' '}
                <span className="text-foreground">{template.requester}{template.department ? ` (${template.department})` : ''}</span>
              </div>
            )}
            {template.detailUrlOverride && (
              <div className="col-span-2">
                <span className="text-muted-foreground">상세 URL:</span>{' '}
                <a href={template.detailUrlOverride} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{template.detailUrlOverride}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
