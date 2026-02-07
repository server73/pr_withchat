'use client';

import { useState } from 'react';
import { useSchema } from '@/lib/schemaContext';
import SchemaEditor from '@/components/admin/SchemaEditor';
import { Plus, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/iconMap';

export default function AdminPage() {
  const { schemas, addSchema } = useSchema();
  const [selectedId, setSelectedId] = useState<string>(schemas[0]?.id || '');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const selectedSchema = schemas.find((s) => s.id === selectedId);

  const handleAddSchema = () => {
    if (!newId || !newLabel) return;
    addSchema({
      id: newId,
      label: newLabel,
      description: newDesc || `${newLabel} 구매요청`,
      icon: 'Box',
      color: 'gray',
      fields: [],
      active: true,
    });
    setSelectedId(newId);
    setNewId('');
    setNewLabel('');
    setNewDesc('');
    setShowNewForm(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-chat-bg">
      <div className="p-8 max-w-[1200px] mx-auto">
        {/* 페이지 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">스키마 관리</h1>
            <p className="text-sm text-muted-foreground">구매유형별 필수/선택 필드를 설정합니다</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* 좌측: 구매유형 목록 */}
          <div className="w-[240px] shrink-0">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">구매 유형</p>
              </div>
              <div className="p-2 space-y-1">
                {schemas.map((schema) => {
                  const Icon = getIcon(schema.icon);
                  const isSelected = schema.id === selectedId;
                  return (
                    <button
                      key={schema.id}
                      onClick={() => setSelectedId(schema.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                        isSelected
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-foreground',
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', isSelected && 'text-blue-700')}>
                          {schema.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {schema.fields.length}개 필드
                          {!schema.active && ' · 비활성'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 새 유형 추가 */}
              <div className="p-2 border-t border-border">
                {showNewForm ? (
                  <div className="p-3 space-y-2">
                    <input
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-white"
                      placeholder="유형 ID (영문)"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value)}
                    />
                    <input
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-white"
                      placeholder="유형명 (한글)"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                    />
                    <input
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-white"
                      placeholder="설명"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleAddSchema}
                        disabled={!newId || !newLabel}
                        className="flex-1 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                      >
                        추가
                      </button>
                      <button
                        onClick={() => setShowNewForm(false)}
                        className="flex-1 py-1.5 text-xs rounded-lg border border-border hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewForm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    유형 추가
                  </button>
                )}
              </div>
            </div>

            {/* JSON 미리보기 안내 */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-border">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                이 스키마는 LLM Agent에게 전달되어 대화 흐름을 결정합니다.
                필드를 추가/수정하면 대화 시나리오가 자동으로 변경됩니다.
              </p>
            </div>
          </div>

          {/* 우측: 스키마 편집 */}
          <div className="flex-1 min-w-0">
            {selectedSchema ? (
              <SchemaEditor key={selectedSchema.id} schema={selectedSchema} />
            ) : (
              <div className="bg-white rounded-xl border border-border py-20 text-center">
                <p className="text-muted-foreground text-sm">좌측에서 구매유형을 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
