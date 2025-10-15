
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VideoData {
  id: string;
  youtube_id: string;
  title: string;
  credit?: string;
  thumbnail?: string;
  display_order: number;
  is_active: boolean;
}

export interface HomeSettings {
  id: string;
  show_hero: boolean;
  show_news_section: boolean;
  show_personalities: boolean;
  show_live_banner: boolean;
  show_stats_section: boolean; // Added new setting
  created_at?: string;
  updated_at?: string;
}

export const defaultSettings: HomeSettings = {
  id: "",
  show_hero: true,
  show_news_section: true,
  show_personalities: true,
  show_live_banner: true,
  show_stats_section: true, // Added default for new setting
};

interface HomeSettingsContextType {
  settings: HomeSettings;
  setSettings: React.Dispatch<React.SetStateAction<HomeSettings>>;
  featuredVideos: VideoData[];
  setFeaturedVideos: React.Dispatch<React.SetStateAction<VideoData[]>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
}

const HomeSettingsContext = createContext<HomeSettingsContextType | undefined>(undefined);

export const HomeSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data when the provider mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch home settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();

        if (settingsError) {
          console.error("Error fetching home settings:", settingsError);
        } else if (settingsData) {
          setSettings(settingsData as HomeSettings);
        }

        // Fetch featured videos
        const { data: videosData, error: videosError } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true });

        if (videosError) {
          console.error("Error fetching featured videos:", videosError);
        } else if (videosData) {
          setFeaturedVideos(videosData || []);
        }
      } catch (error) {
        console.error("Error in fetchInitialData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <HomeSettingsContext.Provider value={{ 
      settings, 
      setSettings, 
      featuredVideos, 
      setFeaturedVideos, 
      isSaving, 
      setIsSaving,
      isLoading
    }}>
      {children}
    </HomeSettingsContext.Provider>
  );
};

export const useHomeSettings = () => {
  const context = useContext(HomeSettingsContext);
  if (context === undefined) {
    throw new Error("useHomeSettings must be used within a HomeSettingsProvider");
  }
  return context;
};
