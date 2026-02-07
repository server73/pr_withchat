'use client';

import { useState } from 'react';
import type { PurchaseTypeSchema, FieldSchema, FieldType } from '@/types';
import { useSchema } from '@/lib/schemaContext';
import { Plus, Settings2, Power, PowerOff, Trash2 } from 'lucide-react';
import FieldRow from './FieldRow';

interface SchemaEditorProps {
  schema: PurchaseTypeSchema;
}

const EMPTY_FIELD: FieldSchema = {
  key: '',
  label: '',
  type: 'string',
  required: true,
};

export default function SchemaEditor({ schema }: SchemaEditorProps) {
  const { updateSchema, updateField, deleteField, addField, deleteSchema } = useSchema();
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState({ label: schema.label, description: schema.description });
  const [addingField, setAddingField] = useState(false);
  const [newField, setNewField] = useState<FieldSchema>(EMPTY_FIELD);

  const handleSaveHeader = () => {
    updateSchema(schema.id, headerDraft);
    setEditingHeader(false);
  };

  const handleAddField = () => {
    if (!newField.key || !newField.label) return;
    addField(schema.id, newField);
    setNewField(EMPTY_FIELD);
    setAddingField(false);
  };

  const requiredCount = schema.fields.filter((f) => f.required).length;
  const optionalCount = schema.fields.filter((f) => !f.required).length;

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          {editingHeader ? (
            <div className="flex-1 space-y-3">
              <input
                className="w-full px-3 py-2 border border-border rounded-lg text-lg font-bold bg-white"
                value={headerDraft.label}
                onChange={(e) => setHeaderDraft({ ...headerDraft, label: e.target.value })}
              />
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white resize-none"
                rows={2}
                value={headerDraft.description}
                onChange={(e) => setHeaderDraft({ ...headerDraft, description: e.target.value })}
              />
              <div className="flex gap-2">
                <button onClick={handleSaveHeader} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  저장
                </button>
                <button onClick={() => setEditingHeader(false)} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-gray-50 transition-colors">
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-foreground">{schema.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">{schema.description}</p>
            </div>
          )}

          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => {
                setHeaderDraft({ label: schema.label, description: schema.description });
                setEditingHeader(!editingHeader);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors"
              title="유형 정보 편집"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSchema(schema.id, { active: !schema.active })}
              className={`p-2 rounded-lg transition-colors ${
                schema.active
                  ? 'hover:bg-amber-50 text-green-600'
                  : 'hover:bg-green-50 text-muted-foreground'
              }`}
              title={schema.active ? '비활성화' : '활성화'}
            >
              {schema.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if (confirm(`'${schema.label}' 구매유형을 삭제하시겠습니까?`)) {
                  deleteSchema(schema.id);
                }
              }}
              className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
              title="유형 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-muted-foreground">필수 {requiredCount}개</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-muted-foreground">선택 {optionalCount}개</span>
          </div>
          <div className="text-xs text-muted-foreground">
            · ID: <span className="font-mono">{schema.id}</span>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full ${
            schema.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-muted-foreground'
          }`}>
            {schema.active ? '활성' : '비활성'}
          </div>
        </div>
      </div>

      {/* 필드 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">필드 구성</h3>
          <button
            onClick={() => setAddingField(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            필드 추가
          </button>
        </div>

        <div className="space-y-2">
          {schema.fields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              onUpdate={(key, updates) => updateField(schema.id, key, updates)}
              onDelete={(key) => deleteField(schema.id, key)}
            />
          ))}

          {/* 새 필드 추가 폼 */}
          {addingField && (
            <div className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/30 p-5 space-y-4">
              <p className="text-sm font-semibold text-blue-700">새 필드 추가</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">필드 키 (API)</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    value={newField.key}
                    onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                    placeholder="예: budgetCode"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">라벨 (한글)</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="예: 예산코드"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">타입</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                  >
                    <option value="string">텍스트</option>
                    <option value="number">숫자</option>
                    <option value="enum">선택형</option>
                    <option value="date">날짜</option>
                    <option value="text">장문 텍스트</option>
                    <option value="catalog">카탈로그</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">필수 여부</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    value={newField.required ? 'true' : 'false'}
                    onChange={(e) => setNewField({ ...newField, required: e.target.value === 'true' })}
                  >
                    <option value="true">필수</option>
                    <option value="false">선택</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">LLM 설명</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    value={newField.description || ''}
                    onChange={(e) => setNewField({ ...newField, description: e.target.value || undefined })}
                    placeholder="필드 설명"
                  />
                </div>
              </div>
              {newField.type === 'enum' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">선택 값 (쉼표 구분)</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    value={(newField.values || []).join(', ')}
                    onChange={(e) =>
                      setNewField({ ...newField, values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })
                    }
                    placeholder="값1, 값2, 값3"
                  />
                </div>
              )}
              {newField.type === 'catalog' && (
                <div className="space-y-3 p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700">카탈로그 설정</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">값 필드 (valueField)</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        value={newField.catalogConfig?.valueField || ''}
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            catalogConfig: { displayFields: newField.catalogConfig?.displayFields || [], valueField: e.target.value, labelField: newField.catalogConfig?.labelField || '' },
                          })
                        }
                        placeholder="예: code"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">라벨 필드 (labelField)</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        value={newField.catalogConfig?.labelField || ''}
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            catalogConfig: { displayFields: newField.catalogConfig?.displayFields || [], valueField: newField.catalogConfig?.valueField || '', labelField: e.target.value },
                          })
                        }
                        placeholder="예: name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">표시 필드 (쉼표 구분)</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        value={(newField.catalogConfig?.displayFields || []).join(', ')}
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            catalogConfig: { displayFields: e.target.value.split(',').map((v) => v.trim()).filter(Boolean), valueField: newField.catalogConfig?.valueField || '', labelField: newField.catalogConfig?.labelField || '' },
                          })
                        }
                        placeholder="code, name, spec, unitPrice"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setAddingField(false); setNewField(EMPTY_FIELD); }}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddField}
                  disabled={!newField.key || !newField.label}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  추가
                </button>
              </div>
            </div>
          )}

          {schema.fields.length === 0 && !addingField && (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              필드가 없습니다. &quot;필드 추가&quot; 버튼을 눌러 필드를 추가하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
