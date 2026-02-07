'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChatEngine } from '@/hooks/useChatEngine';
import { usePR } from '@/lib/prContext';
import { useSchema } from '@/lib/schemaContext';
import { ShoppingCart } from 'lucide-react';
import { getIcon, getGradient } from '@/lib/iconMap';
import MessageBubble from './MessageBubble';
import QuickReplyButtons from './QuickReplyButtons';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

export default function ChatContainer() {
  const { messages, isTyping, currentStep, startChat, startWithCategory, sendMessage, lastPR } = useChatEngine();
  const { addPurchaseRequest } = usePR();
  const { activeSchemas } = useSchema();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (currentStep === 'completed' && lastPR && !submittedRef.current.has(lastPR.id)) {
      submittedRef.current.add(lastPR.id);
      addPurchaseRequest(lastPR);
    }
  }, [currentStep, lastPR, addPurchaseRequest]);

  const handleQuickReply = (value: string) => {
    if (value === '__restart__') {
      startChat();
      return;
    }
    if (value === '__dashboard__') {
      router.push('/dashboard');
      return;
    }
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot' && m.options);
    const option = lastBotMsg?.options?.find((o) => o.value === value);
    sendMessage(value, option?.label);
  };

  const handleCategoryClick = (schemaId: string, label: string) => {
    startWithCategory(schemaId, label);
  };

  const lastMessage = messages[messages.length - 1];
  const showQuickReplies = lastMessage?.sender === 'bot' && lastMessage.options && !isTyping;
  const inputDisabled = isTyping || !!showQuickReplies;

  // 웰컴 스크린
  if (currentStep === 'idle' && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">구매요청 도우미</h1>
          <p className="text-muted-foreground mb-10">무엇을 구매하시겠습니까?</p>

          <div className="flex gap-4 flex-wrap justify-center">
            {activeSchemas.map((schema) => {
              const Icon = getIcon(schema.icon);
              const gradient = getGradient(schema.color);
              return (
                <button
                  key={schema.id}
                  onClick={() => handleCategoryClick(schema.id, schema.label)}
                  className="group w-[200px] p-5 rounded-2xl border border-border bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 text-left cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-[15px] text-foreground mb-1">{schema.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{schema.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <ChatInput onSend={sendMessage} disabled placeholder="구매할 항목을 입력하세요..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
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
        />
      </div>
    </div>
  );
}
