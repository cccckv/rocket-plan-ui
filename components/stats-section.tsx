"use client";

import * as React from "react";
import { Users, Video, Globe } from "lucide-react";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

export function StatsSection() {
  const { t } = useI18n();

  const stats = [
    { icon: Users, value: "200K+", label: t.stats.activeUsers },
    { icon: Video, value: "5M+", label: t.stats.videosGenerated },
    { icon: Globe, value: "20+", label: t.stats.countries },
  ];

  return (
    <section className="w-full px-6 py-24">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="animate-fade-in">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-semibold text-white md:text-5xl">
              {t.stats.title}
            </h2>
            <p className="text-zinc-300">{t.stats.description}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="animate-fade-in">
              <GlowingCard className="text-card-foreground shadow rounded-3xl border border-border bg-muted/30">
                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900">
                    <stat.icon className="h-7 w-7 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-zinc-400">{stat.label}</div>
                  </div>
                </div>
              </GlowingCard>
            </div>
          ))}
        </div>

        <div className="animate-fade-in">
          <div className="space-y-6">
            <h3 className="text-center text-sm font-semibold text-zinc-400">
              {t.stats.certifiedTitle}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300">
                <Badge className="h-2 w-2 rounded-full bg-emerald-600 p-0" />
                {t.stats.tiktokPartner}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300">
                <Badge className="h-2 w-2 rounded-full bg-emerald-600 p-0" />
                {t.stats.gdpr}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
