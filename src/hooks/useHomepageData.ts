
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HomeSettings, defaultSettings, VideoData } from "@/components/staff/home/context/HomeSettingsContext";

// Interface for homepage_content table data
export interface HomepageContentData {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_background_image?: string; 
  current_show_enabled: boolean;
  current_show_title: string;
  current_show_description: string;
  current_show_host: string;
  current_show_time: string;
  stats_listeners: string;
  stats_shows: string;
  stats_members: string;
  stats_broadcasts: string;
  cta_section_title: string;
  cta_section_subtitle: string;
  cta_button_text: string;
}

// Default values for homepage content
export const defaultHomepageContentData: HomepageContentData = {
  hero_title: "Your Voice, Your Station",
  hero_subtitle: "Experience the best in community radio with live shows, music, discussions, and more.",
  hero_cta_text: "Listen Live",
  hero_background_image: "", 
  current_show_enabled: true,
  current_show_title: "Morning Drive Time",
  current_show_description: "Start your day with the latest music, news, and community updates.",
  current_show_host: "Sarah & Mike",
  current_show_time: "6:00 AM - 10:00 AM",
  stats_listeners: "1.2M",
  stats_shows: "50+",
  stats_members: "10K+",
  stats_broadcasts: "24/7",
  cta_section_title: "Join Our Community",
  cta_section_subtitle: "Become part of our growing community. Share your thoughts, discover new music, and connect with fellow radio enthusiasts.",
  cta_button_text: "Sign Up Today"
};

interface UseHomepageDataReturn {
  settings: HomeSettings;
  homepageContent: HomepageContentData;
  featuredVideos: VideoData[];
  isLoading: boolean;
  showFeaturedArtist: boolean;
}

export const useHomepageData = (): UseHomepageDataReturn => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [homepageContent, setHomepageContent] = useState<HomepageContentData>(defaultHomepageContentData);
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeaturedArtist, setShowFeaturedArtist] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (settingsError) console.error("Error fetching home settings:", settingsError);
        
        if (settingsData) setSettings(settingsData as HomeSettings);
        else setSettings(defaultSettings);


        const { data: contentData, error: contentError } = await supabase
          .from("homepage_content")
          .select("*")
          .eq('id', 1)
          .maybeSingle();

        if (contentError) {
          console.error("Error fetching homepage content:", contentError);
          setHomepageContent(defaultHomepageContentData);
        } else if (contentData) {
          setHomepageContent(contentData);
        } else {
          setHomepageContent(defaultHomepageContentData);
        }
        
        const { data: videosData, error: videosError } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);
          
        if (videosError) console.error("Error fetching featured videos:", videosError);
        else setFeaturedVideos(videosData || []);

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
        setSettings(defaultSettings);
        setHomepageContent(defaultHomepageContentData);
        setFeaturedVideos([]);
        setShowFeaturedArtist(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { settings, homepageContent, featuredVideos, isLoading, showFeaturedArtist };
};
