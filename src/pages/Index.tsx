
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";
import VideoGallery from "@/components/VideoGallery";
import { supabase } from "@/integrations/supabase/client";
import { HomeSettings, defaultSettings, VideoData } from "@/components/staff/home/context/HomeSettingsContext";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert Json to VideoData[]
const parseVideoData = (jsonData: Json | null): VideoData[] => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return defaultSettings.featured_videos;
  }
  
  try {
    return jsonData.map((video: any) => ({
      id: video.id || "",
      title: video.title || "Untitled Video",
      credit: video.credit,
      thumbnail: video.thumbnail
    }));
  } catch (error) {
    console.error("Error parsing video data:", error);
    return defaultSettings.featured_videos;
  }
};

const Index = () => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching home settings:", error);
          setSettings(defaultSettings);
        } else if (data) {
          // Convert featured_videos from Json to VideoData[]
          const parsedVideos = parseVideoData(data.featured_videos);
          
          setSettings({
            ...data,
            featured_videos: parsedVideos
          } as HomeSettings);
        }
      } catch (error) {
        console.error("Error in home settings fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeSettings();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {settings.show_hero && <Hero videoBackgrounds={settings.featured_videos} />}
      
      {/* VideoGallery is always shown for now, but uses dynamic video data */}
      <VideoGallery videos={settings.featured_videos} />
      
      <div className="container mx-auto px-4 py-8">
        {settings.show_live_banner && <LiveShowBanner />}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {settings.show_news_section && <HomeNewsSection />}
          {settings.show_personalities && <PersonalitySlider />}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
