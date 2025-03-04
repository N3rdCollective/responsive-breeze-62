
import { useState } from "react";
import { VideoData } from "../context/HomeSettingsContext";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useVideoTitleRefresh = () => {
  const { featuredVideos, setFeaturedVideos } = useHomeSettings();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const updateVideoField = (index: number, field: keyof VideoData, value: string | number | boolean) => {
    setFeaturedVideos(prev => {
      const updatedVideos = [...prev];
      updatedVideos[index] = { ...updatedVideos[index], [field]: value };
      return updatedVideos;
    });
  };

  const refreshVideoTitle = async (index: number) => {
    const video = featuredVideos[index];
    setIsValidating(true);
    
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtube_id}&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        
        const { error } = await supabase
          .from("featured_videos")
          .update({ title: data.title })
          .eq("id", video.id);
          
        if (error) throw error;
        
        updateVideoField(index, 'title', data.title);
        
        toast({
          title: "Title updated",
          description: `Updated title to "${data.title}"`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not fetch video information from YouTube",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error refreshing video title:", error);
      toast({
        title: "Error",
        description: "Failed to update video title",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const refreshAllVideoTitles = async () => {
    setIsValidating(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      for (let i = 0; i < featuredVideos.length; i++) {
        const video = featuredVideos[i];
        
        try {
          const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.youtube_id}&format=json`);
          
          if (response.ok) {
            const data = await response.json();
            
            const { error } = await supabase
              .from("featured_videos")
              .update({ title: data.title })
              .eq("id", video.id);
              
            if (error) throw error;
            
            updateVideoField(i, 'title', data.title);
            successCount++;
          } else {
            failCount++;
            console.error(`Could not fetch info for video ID: ${video.youtube_id}`);
          }
        } catch (err) {
          failCount++;
          console.error(`Error processing video ${video.youtube_id}:`, err);
        }
      }
      
      toast({
        title: "Titles updated",
        description: `Successfully updated ${successCount} video titles${failCount > 0 ? `, ${failCount} failed` : ''}`,
        variant: successCount > 0 ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error refreshing video titles:", error);
      toast({
        title: "Error",
        description: "Failed to update video titles",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    refreshVideoTitle,
    refreshAllVideoTitles
  };
};
