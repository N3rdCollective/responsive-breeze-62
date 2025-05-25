
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero"; 
import Footer from "@/components/Footer";
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";
import VideoGallery from "@/components/VideoGallery";
import FeaturedArtistSection from "@/components/home/FeaturedArtistSection";
import TitleUpdater from "@/components/TitleUpdater";

// Newly imported components and hook
import PageLoader from "@/components/general/PageLoader";
import StatsSection from "@/components/home/StatsSection";
import CtaSection from "@/components/home/CtaSection";
import { useHomepageData } from "@/hooks/useHomepageData";

// The types HomepageContentData, defaultHomepageContentData, HomeSettings, defaultSettings, VideoData
// are now primarily managed by useHomepageData.ts or their original import sources.

const Index = () => {
  const { 
    settings, 
    homepageContent, 
    featuredVideos, 
    isLoading, 
    showFeaturedArtist 
  } = useHomepageData();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TitleUpdater />
      <Navbar />
      
      {settings.show_hero && (
        <Hero
          videoBackgrounds={featuredVideos}
          title={homepageContent.hero_title}
          subtitle={homepageContent.hero_subtitle}
          ctaText={homepageContent.hero_cta_text}
        />
      )}
      
      <VideoGallery videos={featuredVideos} /> 
      
      <div className="container mx-auto px-4 py-8">
        {settings.show_live_banner && <LiveShowBanner />}
      </div>

      <StatsSection stats={{
        broadcasts: homepageContent.stats_broadcasts,
        shows: homepageContent.stats_shows,
        listeners: homepageContent.stats_listeners,
        members: homepageContent.stats_members,
      }} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {showFeaturedArtist && <FeaturedArtistSection />}
          {settings.show_news_section && <HomeNewsSection />}
          {settings.show_personalities && <PersonalitySlider />}
        </div>
      </div>

      <CtaSection 
        title={homepageContent.cta_section_title}
        subtitle={homepageContent.cta_section_subtitle}
        buttonText={homepageContent.cta_button_text}
      />
      
      <Footer />
    </div>
  );
};

export default Index;
