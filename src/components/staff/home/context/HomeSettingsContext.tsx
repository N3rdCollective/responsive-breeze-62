import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

const HomeSettingsContext = createContext<HomeSettingsContextType | undefined>(undefined);

export const HomeSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <HomeSettingsContext.Provider value={{ 
      settings, 
      setSettings, 
      featuredVideos, 
      setFeaturedVideos, 
      isSaving, 
      setIsSaving 
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
