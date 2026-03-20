import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { VideoGeneratorForm } from "@/components/video-generator-form";
import { StatsSection } from "@/components/stats-section";
import { FeaturesSection } from "@/components/features-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main className="flex flex-col">
        <HeroSection />
        <div className="w-full px-4 py-8">
          <VideoGeneratorForm />
        </div>
        <StatsSection />
        <FeaturesSection />
      </main>
    </div>
  );
}
