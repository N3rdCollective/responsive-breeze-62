
import React, { useState } from "react";
import Hero from "@/components/Hero"; 
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";
import VideoGallery from "@/components/VideoGallery";
import FeaturedArtistSection from "@/components/home/FeaturedArtistSection";
import TitleUpdater from "@/components/TitleUpdater";
import AuthModal from "@/components/auth/AuthModal";
import PageLoader from "@/components/general/PageLoader";
import StatsSection from "@/components/home/StatsSection";
import CtaSection from "@/components/home/CtaSection";
import SongRequestWidget from "@/components/SongRequestWidget";
import { useHomepageData } from "@/hooks/useHomepageData";

const Index = () => {
  const { 
    settings, 
    homepageContent, 
    featuredVideos, 
    isLoading, 
    showFeaturedArtist 
  } = useHomepageData();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  console.log('🏠 Index page render:', {
    featuredVideos: featuredVideos.length,
    isLoading,
    settings: settings?.show_hero
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const handleAuthModalOpen = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TitleUpdater />
      
      {settings.show_hero && (
        <Hero
          videoBackgrounds={featuredVideos}
          title={homepageContent.hero_title}
          subtitle={homepageContent.hero_subtitle}
          ctaText={homepageContent.hero_cta_text}
        />
      )}
      
      <VideoGallery videos={featuredVideos} onAuthModalOpen={handleAuthModalOpen} /> 
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {settings.show_live_banner && <LiveShowBanner />}
      </div>

      {settings.show_stats_section && (
        <StatsSection stats={{
          broadcasts: homepageContent.stats_broadcasts,
          shows: homepageContent.stats_shows,
          listeners: homepageContent.stats_listeners,
          members: homepageContent.stats_members,
        }} />
      )}
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="space-y-12 sm:space-y-16">
          {showFeaturedArtist && <FeaturedArtistSection />}
          {settings.show_news_section && <HomeNewsSection onAuthModalOpen={handleAuthModalOpen} />}
          {settings.show_personalities && <PersonalitySlider />}
          
          <div className="w-full max-w-none">
            <SongRequestWidget />
          </div>
        </div>
      </div>

      <CtaSection 
        title={homepageContent.cta_section_title}
        subtitle={homepageContent.cta_section_subtitle}
        buttonText={homepageContent.cta_button_text}
      />

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
};

export default Index;
