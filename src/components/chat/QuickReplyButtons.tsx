import type { QuickReplyOption } from '@/types';

interface QuickReplyButtonsProps {
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function QuickReplyButtons({ options, onSelect, disabled }: QuickReplyButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-10 animate-slide-up">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          className="px-4 py-2 rounded-xl border border-border bg-white text-[14px] font-medium text-foreground hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs hover:shadow-sm"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
