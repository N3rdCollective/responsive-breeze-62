
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoData } from "@/components/staff/home/context/HomeSettingsContext";

interface UseFetchFeaturedVideosReturn {
  featuredVideos: VideoData[];
  isLoading: boolean;
}

export const useFetchFeaturedVideos = (): UseFetchFeaturedVideosReturn => {
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const { data: videosData, error: videosError } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);

        if (videosError) {
          console.error("Error fetching featured videos:", videosError);
          setFeaturedVideos([]);
        } else {
          setFeaturedVideos(videosData || []);
        }
      } catch (error) {
        console.error("Error in fetchVideos:", error);
        setFeaturedVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { featuredVideos, isLoading };
};
