
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HomeSettings, defaultSettings, useHomeSettings, VideoData } from "../context/HomeSettingsContext";

export const useHomeSettingsData = () => {
  const { 
    setSettings, 
    settings, 
    isSaving, 
    setIsSaving, 
    setFeaturedVideos, 
    featuredVideos 
  } = useHomeSettings();
  const { toast } = useToast();

  const { isLoading } = useQuery({
    queryKey: ["home-settings"],
    queryFn: async () => {
      try {
        // First, fetch the home settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (settingsError) throw settingsError;
        
        // Fetch the featured videos
        const { data: videoData, error: videoError } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);
          
        if (videoError) throw videoError;
        
        // Set the videos in state
        setFeaturedVideos(videoData || []);
        
        if (settingsData) {
          setSettings(settingsData as HomeSettings);
          return { settingsData, videoData };
        }
        
        // If no settings exist, create default settings
        const { data: newData, error: insertError } = await supabase
          .from("home_settings")
          .insert([defaultSettings])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        if (newData) {
          setSettings(newData as HomeSettings);
          return { settingsData: newData, videoData };
        }
        
        return { settingsData: defaultSettings, videoData };
      } catch (error) {
        console.error("Error fetching home settings:", error);
        toast({
          title: "Error",
          description: "Failed to load home page settings",
          variant: "destructive",
        });
        return { settingsData: defaultSettings, videoData: [] };
      }
    },
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save the home settings
      const { error: settingsError } = await supabase
        .from("home_settings")
        .upsert(settings)
        .select();
        
      if (settingsError) throw settingsError;
      
      // Save any changes to the featured videos
      // Note: This is a simplified approach; a more complete solution would handle
      // creation, updates, and deletion of videos
      for (const video of featuredVideos) {
        const { error: videoError } = await supabase
          .from("featured_videos")
          .upsert({
            id: video.id,
            youtube_id: video.youtube_id,
            title: video.title,
            credit: video.credit,
            thumbnail: video.thumbnail,
            display_order: video.display_order,
            is_active: video.is_active
          });
          
        if (videoError) throw videoError;
      }
      
      toast({
        title: "Success",
        description: "Home page settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving home settings:", error);
      toast({
        title: "Error",
        description: "Failed to save home page settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (field: keyof HomeSettings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return {
    isLoading,
    handleSaveSettings,
    handleToggle,
    isSaving,
    settings,
    featuredVideos,
    setFeaturedVideos
  };
};
