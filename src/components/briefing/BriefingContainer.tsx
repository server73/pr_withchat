'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBriefingEngine } from '@/hooks/useBriefingEngine';
import { useBriefingConfig } from '@/lib/briefingConfigContext';
import { useUserBriefingPrefs } from '@/lib/userBriefingPrefsContext';
import { usePR } from '@/lib/prContext';
import { Sun, Settings } from 'lucide-react';
import { getTimeGreeting } from '@/lib/briefingDataGenerator';
import MessageBubble from '@/components/chat/MessageBubble';
import QuickReplyButtons from '@/components/chat/QuickReplyButtons';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import BriefingSettingsPanel from './BriefingSettingsPanel';

export default function BriefingContainer() {
  const { messages, isTyping, currentStep, startBriefing, selectTask, sendMessage } = useBriefingEngine();
  const { roles, getEnabledItems } = useBriefingConfig();
  const { prefs } = useUserBriefingPrefs();
  const { purchaseRequests } = usePR();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleQuickReply = (value: string) => {
    if (value === '__dashboard__') {
      router.push('/dashboard');
      return;
    }
    if (value === '__restart__') {
      startBriefing(purchaseRequests);
      return;
    }
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot' && m.options);
    const option = lastBotMsg?.options?.find((o) => o.value === value);
    sendMessage(value, option?.label);
  };

  const handleTaskClick = (taskId: string) => {
    selectTask(taskId);
  };

  const handleStartBriefing = () => {
    startBriefing(purchaseRequests);
  };

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies = lastMessage?.sender === 'bot' && lastMessage.options && !isTyping;
  const inputDisabled = isTyping || !!showQuickReplies;

  // 현재 역할 정보
  const activeRole = roles.find((r) => r.id === prefs.activeRoleId);
  const roleLabel = activeRole?.label || '구매담당자';
  const enabledItems = getEnabledItems(prefs.activeRoleId);
  const itemLabels = enabledItems.map((i) => i.label).join(', ');

  // 웰컴 스크린 — 브리핑 시작 전
  if (currentStep === 'idle' && messages.length === 0) {
    const greeting = getTimeGreeting();
    return (
      <div className="flex flex-col h-full relative">
        {/* 설정 버튼 */}
        <div className="absolute top-4 right-4 z-5">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors"
            title="브리핑 설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{roleLabel} 업무 브리핑</h1>
          <p className="text-muted-foreground mb-3">{greeting}, 김관리자 프로님</p>
          <div className="text-sm text-muted-foreground mb-10 max-w-lg text-center space-y-1.5">
            <p>AI 비서가 오늘의 구매 업무를 분석하여</p>
            <p>{itemLabels || '각 항목'} 현황을</p>
            <p>우선순위별로 정리해 드립니다.</p>
          </div>

          <button
            onClick={handleStartBriefing}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-[15px] shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            브리핑 시작하기
          </button>
        </div>

        <ChatInput onSend={sendMessage} disabled placeholder="브리핑을 먼저 시작해주세요..." footerText="AI 비서가 오늘의 구매 업무를 브리핑합니다" />

        {showSettings && <BriefingSettingsPanel onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* 설정 버튼 */}
      <div className="absolute top-4 right-4 z-5">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors"
          title="브리핑 설정"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onTaskClick={handleTaskClick} />
          ))}

          {showQuickReplies && lastMessage.options && (
            <QuickReplyButtons options={lastMessage.options} onSelect={handleQuickReply} />
          )}

          {isTyping && <TypingIndicator />}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-chat-bg to-transparent pointer-events-none" />
        <ChatInput
          onSend={sendMessage}
          disabled={inputDisabled}
          placeholder={showQuickReplies ? '위 버튼 중에서 선택해주세요' : '메시지를 입력하세요...'}
          footerText="AI 비서가 오늘의 구매 업무를 브리핑합니다"
        />
      </div>

      {showSettings && <BriefingSettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
