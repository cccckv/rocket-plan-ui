'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { HeroSectionSimple } from '@/components/dashboard/hero-section-simple';
import { VideoGeneratorForm } from '@/components/video-generator-form';
import { getBalance } from '@/lib/api/credits';

export default function DashboardPage() {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await getBalance();
      setCredits(data.credits);
    } catch (error) {
      console.error('Failed to load credits:', error);
    }
  };

  return (
    <DashboardLayout credits={credits}>
      <div className="flex flex-col">
        <HeroSectionSimple />
        <div className="w-full px-4 py-8">
          <VideoGeneratorForm onCreditsChange={loadCredits} />
        </div>
      </div>
    </DashboardLayout>
  );
}
