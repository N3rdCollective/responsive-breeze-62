
import { useState } from "react";
import { VideoData } from "../context/HomeSettingsContext";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useVideoUtils } from "./useVideoUtils";

export const useVideoTitleRefresh = () => {
  const { featuredVideos } = useHomeSettings();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const { updateVideoField, fetchYoutubeVideoInfo, updateVideoInDb } = useVideoUtils();

  const refreshVideoTitle = async (index: number) => {
    const video = featuredVideos[index];
    setIsValidating(true);
    
    try {
      const data = await fetchYoutubeVideoInfo(video.youtube_id);
      
      if (data) {
        const success = await updateVideoInDb(video.id, { title: data.title });
        
        if (success) {
          updateVideoField(index, 'title', data.title);
          
          toast({
            title: "Title updated",
            description: `Updated title to "${data.title}"`,
          });
        } else {
          throw new Error("Failed to update database");
        }
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
          const data = await fetchYoutubeVideoInfo(video.youtube_id);
          
          if (data) {
            const success = await updateVideoInDb(video.id, { title: data.title });
            
            if (success) {
              updateVideoField(i, 'title', data.title);
              successCount++;
            } else {
              failCount++;
            }
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
