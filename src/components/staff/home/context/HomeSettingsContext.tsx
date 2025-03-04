
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Json } from "@/integrations/supabase/types";

export interface VideoData {
  id: string;
  title: string;
  credit?: string;
  thumbnail?: string;
}

export interface HomeSettings {
  id: string;
  show_hero: boolean;
  show_news_section: boolean;
  show_personalities: boolean;
  show_live_banner: boolean;
  featured_videos: VideoData[];
  created_at?: string;
  updated_at?: string;
}

export const defaultSettings: HomeSettings = {
  id: "",
  show_hero: true,
  show_news_section: true,
  show_personalities: true,
  show_live_banner: true,
  featured_videos: [
    { id: "uaGvGnOiY04", title: "Aerial City View at Night" },
    { id: "j4Vg274kOvc", title: "Busy City Street Scene" },
    { id: "PNIBFEJ6UYc", title: "Urban Night Life" },
    { id: "5CqqZRXO7aM", title: "Downtown Buildings" },
    { id: "x06cnZm-Ic4", title: "City Skyline" },
  ]
};

interface HomeSettingsContextType {
  settings: HomeSettings;
  setSettings: React.Dispatch<React.SetStateAction<HomeSettings>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

const HomeSettingsContext = createContext<HomeSettingsContextType | undefined>(undefined);

export const HomeSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <HomeSettingsContext.Provider value={{ settings, setSettings, isSaving, setIsSaving }}>
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
