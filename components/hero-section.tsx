"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section id="hero" className="relative w-full px-4 pt-12 lg:pt-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ 
            opacity: 0.4,
            filter: 'brightness(2) contrast(1.5) saturate(1.5)',
            mixBlendMode: 'screen'
          }}
        >
          <source src="https://static.echotik.live/creatok/landing/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
      </div>
      
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
              <h1 className="text-3xl font-medium tracking-tight text-zinc-100 md:text-5xl">
                Turn one <em className="font-display italic not-italic md:italic">winning</em> video into hundreds
              </h1>
              <p className="mx-auto max-w-4xl text-sm text-zinc-400 md:text-base">
                {t.hero.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
