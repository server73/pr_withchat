import type { ChatMessage } from '@/types';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import PRSummaryCard from './PRSummaryCard';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === 'bot';

  if (isBot) {
    return (
      <div className="flex gap-3 animate-fade-in">
        {/* 봇 아이콘 */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>

        {/* 봇 메시지 — 버블 없이 깔끔한 텍스트 */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[15px] leading-[1.7] text-foreground whitespace-pre-line">
            {message.text}
          </div>

          {message.summaryCard && (
            <div className="mt-3">
              <PRSummaryCard pr={message.summaryCard} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 유저 메시지 — 우측 정렬, 둥근 배경
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="bg-user-bubble text-user-bubble-foreground px-5 py-2.5 rounded-3xl text-[15px] leading-[1.7] max-w-[70%] shadow-sm">
        {message.text}
      </div>
    </div>
  );
}
