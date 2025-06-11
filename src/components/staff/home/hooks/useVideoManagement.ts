
import { useState } from "react";
import { VideoData } from "../context/HomeSettingsContext";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useVideoUtils } from "./useVideoUtils";

export const useVideoManagement = () => {
  const { featuredVideos, setFeaturedVideos } = useHomeSettings();
  const { toast } = useToast();
  const [newVideoId, setNewVideoId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [errorVideoId, setErrorVideoId] = useState("");
  const { updateVideoField, fetchYoutubeVideoInfo } = useVideoUtils();

  const handleRemoveVideo = async (index: number) => {
    const videoToRemove = featuredVideos[index];
    
    if (videoToRemove.id) {
      try {
        const { error } = await supabase
          .from("featured_videos")
          .update({ is_active: false })
          .eq("id", videoToRemove.id);
          
        if (error) throw error;
        
        setFeaturedVideos(prev => prev.filter((_, i) => i !== index));
        
        toast({
          title: "Video removed",
          description: "The video has been removed from the featured list",
        });
      } catch (error) {
        console.error("Error removing video:", error);
        toast({
          title: "Error",
          description: "Failed to remove video",
          variant: "destructive",
        });
      }
    } else {
      setFeaturedVideos(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Video removed",
        description: "The video has been removed from the featured list",
      });
    }
  };

  const validateAndAddVideo = async () => {
    if (!newVideoId.trim()) {
      setErrorVideoId("Please enter a YouTube video ID");
      return;
    }

    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!youtubeIdRegex.test(newVideoId)) {
      setErrorVideoId("Please enter a valid YouTube video ID (11 characters)");
      return;
    }

    setIsValidating(true);
    setErrorVideoId("");

    try {
      const data = await fetchYoutubeVideoInfo(newVideoId);
      
      if (data) {
        const { data: newVideo, error } = await supabase
          .from("featured_videos")
          .insert({
            youtube_id: newVideoId,
            title: data.title,
            display_order: featuredVideos.length + 1,
            is_active: true
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setFeaturedVideos(prev => [...prev, newVideo]);
        
        setNewVideoId("");
        toast({
          title: "Video added",
          description: `Added "${data.title}" to featured videos`,
        });
      } else {
        setErrorVideoId("Could not find a valid YouTube video with this ID");
      }
    } catch (error) {
      console.error("Error validating YouTube video:", error);
      setErrorVideoId("Error validating video. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const moveVideo = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === featuredVideos.length - 1) ||
      isReordering
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setIsReordering(true);
    
    // Optimistically update the UI first
    const newVideos = [...featuredVideos];
    const currentVideo = newVideos[index];
    const swapVideo = newVideos[newIndex];
    
    // Swap display orders
    const tempOrder = currentVideo.display_order;
    currentVideo.display_order = swapVideo.display_order;
    swapVideo.display_order = tempOrder;
    
    // Swap positions in array
    [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
    
    setFeaturedVideos(newVideos);

    try {
      // Update both videos in the database
      const updates = [
        supabase
          .from("featured_videos")
          .update({ display_order: currentVideo.display_order })
          .eq("id", currentVideo.id),
        supabase
          .from("featured_videos")
          .update({ display_order: swapVideo.display_order })
          .eq("id", swapVideo.id)
      ];

      const results = await Promise.all(updates);
      
      // Check for any errors
      for (const result of results) {
        if (result.error) throw result.error;
      }

      toast({
        title: "Order updated",
        description: "Video order has been saved successfully",
      });
    } catch (error) {
      console.error("Error updating video order:", error);
      
      // Revert the optimistic update on error
      setFeaturedVideos(featuredVideos);
      
      toast({
        title: "Error",
        description: "Failed to update video order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReordering(false);
    }
  };

  return {
    featuredVideos,
    newVideoId,
    setNewVideoId,
    isValidating,
    isReordering,
    errorVideoId,
    setErrorVideoId,
    handleUpdateVideoField: updateVideoField,
    handleRemoveVideo,
    validateAndAddVideo,
    moveVideo
  };
};
