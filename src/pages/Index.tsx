
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import LiveShowBanner from "@/components/LiveShowBanner";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import PersonalitySlider from "@/components/home/PersonalitySlider";
import { supabase } from "@/integrations/supabase/client";

interface HomeSettings {
  id: string;
  show_hero: boolean;
  show_news_section: boolean;
  show_personalities: boolean;
  show_live_banner: boolean;
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: HomeSettings = {
  id: "home-settings",
  show_hero: true,
  show_news_section: true,
  show_personalities: true,
  show_live_banner: true
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
          setSettings(data as HomeSettings);
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
      
      {settings.show_hero && <Hero />}
      
      <div className="container mx-auto px-4 py-8">
        {settings.show_live_banner && <LiveShowBanner />}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {settings.show_news_section && <HomeNewsSection />}
          {settings.show_personalities && <PersonalitySlider />}
        </div>
      </div>
      
      <div className="mb-20">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
