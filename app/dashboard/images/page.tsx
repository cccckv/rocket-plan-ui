'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { ImageGeneratorForm } from '@/components/image-generator-form';
import { getBalance } from '@/lib/api/credits';

export default function DashboardImagesPage() {
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
        <div className="w-full px-4 py-4 sm:py-6">
          <ImageGeneratorForm onCreditsChange={loadCredits} />
        </div>
      </div>
    </DashboardLayout>
  );
}
