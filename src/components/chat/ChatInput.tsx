'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  footerText?: string;
}

export default function ChatInput({ onSend, disabled, placeholder = '메시지를 입력하세요...', footerText = 'AI 도우미가 구매요청 작성을 도와드립니다' }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 자동 높이 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="bg-chat-bg px-6 pb-5 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:border-blue-300 focus-within:shadow-md">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50 max-h-40"
          />
          <div className="pr-3 pb-3">
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                canSend
                  ? 'bg-foreground text-background hover:opacity-80 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              )}
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-2.5">
          {footerText}
        </p>
      </div>
    </div>
  );
}
