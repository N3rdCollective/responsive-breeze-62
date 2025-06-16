
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoData } from "@/components/staff/home/context/HomeSettingsContext";

interface UseFeaturedVideosReturn {
  featuredVideos: VideoData[];
  isLoading: boolean;
  error: string | null;
}

export const useFeaturedVideos = (): UseFeaturedVideosReturn => {
  const [featuredVideos, setFeaturedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      console.log('🎬 [FIXED] Fetching featured videos after RLS fix...');
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: videosData, error: videosError } = await supabase
          .from("featured_videos")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (videosError) {
          console.error("🎬 [ERROR] Error fetching featured videos:", videosError);
          setError(videosError.message);
          setFeaturedVideos([]);
        } else {
          console.log('🎬 [SUCCESS] Featured videos fetched successfully after RLS fix:', videosData?.length || 0);
          console.log('🎬 [DATA] Video titles:', videosData?.map(v => v.title) || []);
          setFeaturedVideos(videosData || []);
        }
      } catch (error) {
        console.error("🎬 [EXCEPTION] Error in fetchVideos:", error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setFeaturedVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { featuredVideos, isLoading, error };
};
