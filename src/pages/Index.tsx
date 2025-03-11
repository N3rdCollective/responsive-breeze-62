
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";
import VideoGallery from "@/components/VideoGallery";
import FeaturedArtistSection from "@/components/home/FeaturedArtistSection";
import { supabase } from "@/integrations/supabase/client";
import { HomeSettings, defaultSettings, VideoData } from "@/components/staff/home/context/HomeSettingsContext";

const Index = () => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeaturedArtist, setShowFeaturedArtist] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (settingsError) {
          console.error("Error fetching home settings:", settingsError);
          setSettings(defaultSettings);
        } else if (settingsData) {
          setSettings(settingsData as HomeSettings);
        }
        
        // Fetch featured videos
        const { data: videosData, error: videosError } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);
          
        if (videosError) {
          console.error("Error fetching featured videos:", videosError);
        } else {
          setFeaturedVideos(videosData || []);
        }

        // Check if featured artists exist
        const { data: artistsData, error: artistsError } = await supabase
          .from("featured_artists")
          .select("id")
          .limit(1);

        if (artistsError) {
          console.error("Error checking featured artists:", artistsError);
          setShowFeaturedArtist(false);
        } else {
          setShowFeaturedArtist(artistsData && artistsData.length > 0);
        }
      } catch (error) {
        console.error("Error in data fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {settings.show_hero && <Hero videoBackgrounds={featuredVideos} />}
      
      {/* VideoGallery is always shown but uses dynamic video data */}
      <VideoGallery videos={featuredVideos} />
      
      <div className="container mx-auto px-4 py-8">
        {settings.show_live_banner && <LiveShowBanner />}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {/* Featured Artist Section */}
          {showFeaturedArtist && <FeaturedArtistSection />}
          
          {settings.show_news_section && <HomeNewsSection />}
          {settings.show_personalities && <PersonalitySlider />}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
