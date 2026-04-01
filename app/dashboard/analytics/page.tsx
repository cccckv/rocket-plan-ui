'use client';

import { DashboardLayout } from '@/components/dashboard';
import { Card } from '@/components/ui/card';
import { Upload, Link as LinkIcon, ArrowUp, Sparkles, FileText, Copy, Wand2 } from 'lucide-react';

function PageTitle() {
  return (
    <div className="pt-4 pb-4 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-3xl">
        Turn one winning video into hundreds.
      </h1>
    </div>
  );
}

function TagPill({ children, variant = 'green', icon: Icon }: { children: React.ReactNode; variant?: 'green' | 'yellow' | 'blue'; icon: React.ComponentType<{ className?: string }> }) {
  const variants = {
    green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50',
    yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50',
  };

  return (
    <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${variants[variant]}`}>
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function InputCard() {
  return (
    <Card className="p-4 bg-card/50 border-border relative">
      <div className="flex flex-wrap gap-2 mb-3">
        <TagPill variant="green" icon={FileText}>Script Analysis</TagPill>
        <TagPill variant="yellow" icon={Copy}>Clone Viral Video</TagPill>
        <TagPill variant="blue" icon={Wand2}>Create Viral Video</TagPill>
      </div>

      <div className="relative">
        <textarea
          placeholder="Upload a video or paste TikTok video link, then ask me anything about the video..."
          className="w-full min-h-[100px] bg-transparent text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none text-sm leading-relaxed"
        />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-md text-xs text-foreground transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload local video</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-md text-xs text-foreground transition-colors">
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Add Video Link</span>
        </button>
      </div>

      <button className="absolute bottom-4 right-4 w-10 h-10 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors disabled:opacity-50" disabled>
        <ArrowUp className="w-4 h-4 text-primary" />
      </button>
    </Card>
  );
}

function SessionHistoryItem({ icon: Icon, title, timestamp }: { icon: React.ComponentType<{ className?: string }>; title: string; timestamp: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 bg-card/30 hover:bg-card/50 border border-border/50 rounded-lg transition-colors text-left">
      <div className="w-9 h-9 rounded-md bg-muted/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground/70 mt-0.5">{timestamp}</div>
      </div>
    </button>
  );
}

function SessionHistory() {
  const sessions = [
    { icon: Sparkles, title: 'Analyze E-commerce Product Video', timestamp: '2 hours ago' },
    { icon: Sparkles, title: 'Clone Viral TikTok Video', timestamp: '5 hours ago' },
    { icon: Sparkles, title: 'Generate Product Showcase', timestamp: '1 day ago' },
    { icon: Sparkles, title: 'Analyze Competitor Strategy', timestamp: '2 days ago' },
  ];

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold text-muted-foreground/80 mb-3 px-0.5 uppercase tracking-wider">
        Chat history
      </h2>
      <div className="space-y-2">
        {sessions.map((session, index) => (
          <SessionHistoryItem
            key={index}
            icon={session.icon}
            title={session.title}
            timestamp={session.timestamp}
          />
        ))}
      </div>
    </div>
  );
}

export default function VideoAnalyticsPage() {
  return (
    <DashboardLayout credits={0}>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="w-full mx-auto px-4 py-4" style={{ maxWidth: '1000px' }}>
          <PageTitle />
          <InputCard />
          <SessionHistory />
        </div>
      </div>
    </DashboardLayout>
  );
}
