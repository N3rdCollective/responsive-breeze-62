
import { VideoData } from "../context/HomeSettingsContext";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { supabase } from "@/integrations/supabase/client";

export const useVideoUtils = () => {
  const { setFeaturedVideos } = useHomeSettings();

  const updateVideoField = (index: number, field: keyof VideoData, value: string | number | boolean) => {
    setFeaturedVideos(prev => {
      const updatedVideos = [...prev];
      updatedVideos[index] = { ...updatedVideos[index], [field]: value };
      return updatedVideos;
    });
  };

  const fetchYoutubeVideoInfo = async (videoId: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Error fetching YouTube video info:", error);
      return null;
    }
  };

  const updateVideoInDb = async (id: string, data: Partial<VideoData>) => {
    try {
      const { error } = await supabase
        .from("featured_videos")
        .update(data)
        .eq("id", id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating video in database:", error);
      return false;
    }
  };

  return {
    updateVideoField,
    fetchYoutubeVideoInfo,
    updateVideoInDb
  };
};
