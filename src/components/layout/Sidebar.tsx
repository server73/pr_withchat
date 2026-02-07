'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutDashboard, MessageCircle, Settings, Sun } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/chat', label: '구매요청', icon: MessageSquare },
  { href: '/briefing', label: '업무 브리핑', icon: Sun },
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin', label: '관리자 설정', icon: Settings },
];

const recentChats = [
  '노트북 구매요청',
  '복합기 토너 구매',
  '사무용 의자 교체',
  '개발팀 모니터 구매',
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-full">
      {/* 네비게이션 */}
      <div className="pt-3" />
      <nav className="px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-white'
                  : 'text-neutral-400 hover:bg-sidebar-muted hover:text-white',
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10 my-3 mx-3" />

      {/* 최근 대화 */}
      <div className="flex-1 overflow-y-auto px-2">
        <p className="px-3 py-2 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
          최근 대화
        </p>
        <div className="space-y-0.5">
          {recentChats.map((chat) => (
            <button
              key={chat}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-neutral-400 hover:bg-sidebar-muted hover:text-white transition-colors text-left"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 opacity-50" />
              <span className="truncate">{chat}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* 사용자 정보 */}
      <div className="p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-muted transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[12px] font-bold text-white">
            김
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate">김관리자</p>
            <p className="text-[11px] text-neutral-500 truncate">경영지원팀</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
