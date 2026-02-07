'use client';

import { useState } from 'react';
import type { FieldSchema, FieldType, CatalogConfig } from '@/types';
import { Pencil, Trash2, GripVertical, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const TYPE_LABELS: Record<FieldType, string> = {
  string: '텍스트',
  number: '숫자',
  enum: '선택형',
  date: '날짜',
  text: '장문 텍스트',
  catalog: '카탈로그',
};

const DEFAULT_CATALOG_CONFIG: CatalogConfig = {
  displayFields: [],
  valueField: '',
  labelField: '',
};

interface FieldRowProps {
  field: FieldSchema;
  onUpdate: (key: string, updates: Partial<FieldSchema>) => void;
  onDelete: (key: string) => void;
}

export default function FieldRow({ field, onUpdate, onDelete }: FieldRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FieldSchema>(field);

  const handleSave = () => {
    onUpdate(field.key, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(field);
    setEditing(false);
  };

  const updateCatalogConfig = (updates: Partial<CatalogConfig>) => {
    setDraft({
      ...draft,
      catalogConfig: { ...DEFAULT_CATALOG_CONFIG, ...draft.catalogConfig, ...updates },
    });
  };

  if (editing) {
    return (
      <div className="border border-blue-200 rounded-xl bg-blue-50/50 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">필드 키 (API)</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">라벨 (한글)</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">타입</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as FieldType })}
            >
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">필수 여부</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.required ? 'true' : 'false'}
              onChange={(e) => setDraft({ ...draft, required: e.target.value === 'true' })}
            >
              <option value="true">필수</option>
              <option value="false">선택</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">입력 예시</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={draft.placeholder || ''}
              onChange={(e) => setDraft({ ...draft, placeholder: e.target.value || undefined })}
              placeholder="placeholder"
            />
          </div>
        </div>

        {draft.type === 'enum' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">선택 값 (쉼표 구분)</label>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={(draft.values || []).join(', ')}
              onChange={(e) =>
                setDraft({ ...draft, values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })
              }
              placeholder="값1, 값2, 값3"
            />
          </div>
        )}

        {draft.type === 'catalog' && (
          <div className="space-y-3 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700">카탈로그 설정</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">값 필드 (valueField)</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                  value={draft.catalogConfig?.valueField || ''}
                  onChange={(e) => updateCatalogConfig({ valueField: e.target.value })}
                  placeholder="예: code"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">라벨 필드 (labelField)</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                  value={draft.catalogConfig?.labelField || ''}
                  onChange={(e) => updateCatalogConfig({ labelField: e.target.value })}
                  placeholder="예: name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">표시 필드 (쉼표 구분)</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                  value={(draft.catalogConfig?.displayFields || []).join(', ')}
                  onChange={(e) =>
                    updateCatalogConfig({ displayFields: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })
                  }
                  placeholder="code, name, spec, unitPrice"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">LLM 설명</label>
          <input
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
            value={draft.description || ''}
            onChange={(e) => setDraft({ ...draft, description: e.target.value || undefined })}
            placeholder="이 필드에 대한 설명 (LLM이 대화에 활용)"
          />
        </div>

        {(draft.type === 'number') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">최솟값</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                value={draft.validation?.min ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    validation: { ...draft.validation, min: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">최댓값</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                value={draft.validation?.max ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    validation: { ...draft.validation, max: e.target.value ? Number(e.target.value) : undefined },
                  })
                }
              />
            </div>
          </div>
        )}

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
    <div className="border border-border rounded-xl bg-white hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{field.label}</span>
            <span className="text-xs text-muted-foreground font-mono bg-gray-100 px-1.5 py-0.5 rounded">{field.key}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              field.required
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-muted-foreground'
            }`}>
              {field.required ? '필수' : '선택'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              {TYPE_LABELS[field.type]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(field.key)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pt-0 border-t border-border/50 mt-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pt-3">
            {field.description && (
              <div className="col-span-2">
                <span className="text-muted-foreground">LLM 설명:</span>{' '}
                <span className="text-foreground">{field.description}</span>
              </div>
            )}
            {field.placeholder && (
              <div>
                <span className="text-muted-foreground">입력 예시:</span>{' '}
                <span className="text-foreground">{field.placeholder}</span>
              </div>
            )}
            {field.type === 'enum' && field.values && (
              <div>
                <span className="text-muted-foreground">선택 값:</span>{' '}
                <span className="text-foreground">{field.values.join(', ')}</span>
              </div>
            )}
            {field.type === 'catalog' && field.catalogConfig && (
              <>
                <div>
                  <span className="text-muted-foreground">값 필드:</span>{' '}
                  <span className="text-foreground">{field.catalogConfig.valueField}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">라벨 필드:</span>{' '}
                  <span className="text-foreground">{field.catalogConfig.labelField}</span>
                </div>
                {field.catalogConfig.displayFields.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">표시 필드:</span>{' '}
                    <span className="text-foreground">{field.catalogConfig.displayFields.join(', ')}</span>
                  </div>
                )}
              </>
            )}
            {field.validation?.min !== undefined && (
              <div>
                <span className="text-muted-foreground">최솟값:</span>{' '}
                <span className="text-foreground">{field.validation.min}</span>
              </div>
            )}
            {field.validation?.max !== undefined && (
              <div>
                <span className="text-muted-foreground">최댓값:</span>{' '}
                <span className="text-foreground">{field.validation.max}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
