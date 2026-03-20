"use client";

import * as React from "react";
import { Users, Sparkles, Image, Shield, Zap, TrendingUp } from "lucide-react";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

export function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    { icon: Users, title: t.features.noPrompt, description: t.features.noPromptDesc },
    { icon: Sparkles, title: t.features.viralClone, description: t.features.viralCloneDesc },
    { icon: Image, title: t.features.imageToVideo, description: t.features.imageToVideoDesc },
    { icon: Shield, title: t.features.commercial, description: t.features.commercialDesc },
    { icon: Zap, title: t.features.multiModel, description: t.features.multiModelDesc },
    { icon: TrendingUp, title: t.features.tiktokApi, description: t.features.tiktokApiDesc },
  ];

  return (
    <section className="w-full px-6 py-24" id="features">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="animate-fade-in">
          <div className="space-y-3 text-center">
            <Badge
              variant="outline"
              className="rounded-full border-orange-600 px-4 py-1 text-xs text-orange-600"
            >
              {t.features.badge}
            </Badge>
            <h2 className="text-3xl font-semibold text-white md:text-5xl">
              {t.features.title}
            </h2>
          </div>
        </div>

        <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex h-full flex-col">
              <div className="flex-1 animate-fade-in">
                <GlowingCard className="text-card-foreground shadow rounded-3xl h-full border border-border bg-muted/30">
                  <div className="space-y-4 p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-orange-600">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                </GlowingCard>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
