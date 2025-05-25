
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface UseFetchHomepageContentReturn {
  homepageContent: HomepageContentData;
  isLoading: boolean;
}

export const useFetchHomepageContent = (): UseFetchHomepageContentReturn => {
  const [homepageContent, setHomepageContent] = useState<HomepageContentData>(defaultHomepageContentData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error("Error in fetchContent:", error);
        setHomepageContent(defaultHomepageContentData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { homepageContent, isLoading };
};
