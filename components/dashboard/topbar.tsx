'use client';

import {
  HelpCircle,
  MessageSquare,
  Crown,
  Coins,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface TopBarProps {
  className?: string;
  credits?: number;
}

export function TopBar({ className, credits = 0 }: TopBarProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className={cn('h-16 bg-topbar-bg flex items-center justify-end px-6 gap-4', className)}>
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-sidebar-hover transition-colors text-sm">
        <span className="text-pink-500">🎯</span>
        <span>Skills</span>
      </button>

      <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sidebar-hover transition-colors">
        <HelpCircle className="w-5 h-5" />
      </button>

      <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sidebar-hover transition-colors">
        <MessageSquare className="w-5 h-5" />
      </button>

      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-sidebar-hover transition-colors">
        <Crown className="w-4 h-4 text-brand-orange" />
        <span className="text-sm text-brand-orange">升级</span>
      </button>

      <button
        onClick={() => router.push('/dashboard/credits')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sidebar-bg hover:bg-sidebar-hover transition-colors cursor-pointer"
        title={t.credits.viewHistory}
      >
        <Coins className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-medium">{Number(credits).toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">{t.credits.title}</span>
      </button>
    </div>
  );
}
