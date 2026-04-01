'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  credits?: number;
  className?: string;
}

export function DashboardLayout({ children, credits = 0, className }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar credits={credits} />
        
        <main className={cn('flex-1 overflow-y-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
