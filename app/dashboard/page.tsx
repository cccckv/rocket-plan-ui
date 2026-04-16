'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { VideoGeneratorFormWithHistory } from '@/components/video-generator-form-with-history';
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
      <div className="flex flex-col h-full">
        <div className="w-full px-4 py-0">
          <VideoGeneratorFormWithHistory onCreditsChange={loadCredits} />
        </div>
      </div>
    </DashboardLayout>
  );
}
