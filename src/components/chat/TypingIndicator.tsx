import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <span className="text-sm text-muted-foreground">생각하는 중</span>
        {[0, 200, 400].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
            style={{
              animation: 'typing-dot 1.4s ease-in-out infinite',
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
