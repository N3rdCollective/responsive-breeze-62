
import { useState } from "react";
import { VideoData } from "../context/HomeSettingsContext";
import { useHomeSettings } from "../context/HomeSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useVideoManagement = () => {
  const { featuredVideos, setFeaturedVideos } = useHomeSettings();
  const { toast } = useToast();
  const [newVideoId, setNewVideoId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [errorVideoId, setErrorVideoId] = useState("");

  const handleUpdateVideoField = (index: number, field: keyof VideoData, value: string | number | boolean) => {
    setFeaturedVideos(prev => {
      const updatedVideos = [...prev];
      updatedVideos[index] = { ...updatedVideos[index], [field]: value };
      return updatedVideos;
    });
  };

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
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${newVideoId}&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        
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
      (direction === 'down' && index === featuredVideos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setFeaturedVideos(prev => {
      const videos = [...prev];
      
      const temp = videos[index].display_order;
      videos[index].display_order = videos[newIndex].display_order;
      videos[newIndex].display_order = temp;
      
      [videos[index], videos[newIndex]] = [videos[newIndex], videos[index]];
      
      return videos;
    });
  };

  return {
    featuredVideos,
    newVideoId,
    setNewVideoId,
    isValidating,
    errorVideoId,
    setErrorVideoId,
    handleUpdateVideoField,
    handleRemoveVideo,
    validateAndAddVideo,
    moveVideo
  };
};
