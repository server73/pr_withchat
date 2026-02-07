'use client';

import { X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useBriefingConfig } from '@/lib/briefingConfigContext';
import { useUserBriefingPrefs } from '@/lib/userBriefingPrefsContext';
import type { BriefingDensity, BriefingRoleId, UrgencyFilter } from '@/types';

interface BriefingSettingsPanelProps {
  onClose: () => void;
}

export default function BriefingSettingsPanel({ onClose }: BriefingSettingsPanelProps) {
  const { roles, getEnabledItems } = useBriefingConfig();
  const { prefs, updatePrefs, updateItemPref, reorderItemPref, resetPrefs } = useUserBriefingPrefs();

  const enabledItems = getEnabledItems(prefs.activeRoleId);

  const sortedItemPrefs = [...prefs.itemPrefs]
    .filter((ip) => enabledItems.some((ei) => ei.id === ip.itemId))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const getItemLabel = (itemId: string) => {
    return enabledItems.find((i) => i.id === itemId)?.label || itemId;
  };

  const handleMoveUp = (idx: number) => {
    if (idx > 0) reorderItemPref(idx, idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx < sortedItemPrefs.length - 1) reorderItemPref(idx, idx + 1);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/20 z-10" onClick={onClose} />

      {/* 설정 패널 */}
      <div className="absolute top-0 right-0 bottom-0 w-[380px] bg-white border-l border-border z-20 flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">내 브리핑 설정</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 설정 내용 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* 역할 선택 */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">역할 선택</h3>
            <div className="flex gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => updatePrefs({ activeRoleId: role.id as BriefingRoleId })}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                    prefs.activeRoleId === role.id
                      ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
                      : 'border-border text-muted-foreground hover:bg-gray-50'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </section>

          {/* 표시 설정 */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">표시 설정</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">카드 밀도</label>
                <div className="flex gap-2">
                  {(['comfortable', 'compact'] as BriefingDensity[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => updatePrefs({ density: d })}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                        prefs.density === d
                          ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
                          : 'border-border text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      {d === 'comfortable' ? '넉넉하게' : '간결하게'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">금액 표시</span>
                <button
                  onClick={() => updatePrefs({ showAmounts: !prefs.showAmounts })}
                  className={`w-10 h-6 rounded-full transition-colors relative ${prefs.showAmounts ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${prefs.showAmounts ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">기한 표시</span>
                <button
                  onClick={() => updatePrefs({ showDueDates: !prefs.showDueDates })}
                  className={`w-10 h-6 rounded-full transition-colors relative ${prefs.showDueDates ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${prefs.showDueDates ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* 브리핑 항목 관리 */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">브리핑 항목</h3>
            <div className="space-y-1.5">
              {sortedItemPrefs.map((ip, idx) => (
                <div key={ip.itemId} className="flex items-center gap-2 py-1.5">
                  <button
                    onClick={() => updateItemPref(ip.itemId, { visible: !ip.visible })}
                    className={`w-5 h-5 rounded border flex items-center justify-center text-xs transition-colors ${
                      ip.visible
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-transparent hover:border-gray-400'
                    }`}
                  >
                    ✓
                  </button>
                  <span className={`flex-1 text-sm ${ip.visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {getItemLabel(ip.itemId)}
                  </span>
                  <div className="flex">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-100 text-muted-foreground disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === sortedItemPrefs.length - 1}
                      className="p-1 rounded hover:bg-gray-100 text-muted-foreground disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 긴급도 필터 */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">긴급도 필터</h3>
            <div className="flex gap-2">
              {([
                { value: 'all', label: '전체' },
                { value: 'medium_up', label: '보통 이상' },
                { value: 'high_only', label: '긴급만' },
              ] as { value: UrgencyFilter; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updatePrefs({ urgencyFilter: opt.value })}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                    prefs.urgencyFilter === opt.value
                      ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
                      : 'border-border text-muted-foreground hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* 인사말 이름 */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">인사말 이름</h3>
            <input
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={prefs.greetingName}
              onChange={(e) => updatePrefs({ greetingName: e.target.value })}
              placeholder="이름을 입력하세요"
            />
          </section>

          {/* 항목당 최대 건수 */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">항목당 최대 건수</h3>
            <select
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
              value={prefs.maxTasksPerItem}
              onChange={(e) => updatePrefs({ maxTasksPerItem: Number(e.target.value) })}
            >
              <option value={0}>무제한</option>
              <option value={3}>3건</option>
              <option value={5}>5건</option>
              <option value={10}>10건</option>
            </select>
          </section>
        </div>

        {/* 하단 초기화 버튼 */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={resetPrefs}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            기본값으로 초기화
          </button>
        </div>
      </div>
    </>
  );
}
