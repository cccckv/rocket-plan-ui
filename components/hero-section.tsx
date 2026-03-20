"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section id="hero" className="w-full px-4 pt-12 lg:pt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="animate-fade-in">
          <div className="space-y-4 text-center">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 rounded-full border-primary/20 text-primary/80"
            >
              <Users className="h-3 w-3 text-orange-600" />
              {t.hero.badge}
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {t.hero.title}
              </h1>
              <p className="mx-auto max-w-4xl text-sm text-muted-foreground md:text-base">
                {t.hero.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
