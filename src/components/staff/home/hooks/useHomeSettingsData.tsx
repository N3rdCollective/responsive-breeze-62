
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HomeSettings, defaultSettings, useHomeSettings, VideoData } from "../context/HomeSettingsContext";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert Json to VideoData[]
const parseVideoData = (jsonData: Json | null): VideoData[] => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return defaultSettings.featured_videos;
  }
  
  try {
    // Convert JSON array to VideoData[]
    return jsonData.map((video: any) => ({
      id: video.id || "",
      title: video.title || "Untitled Video",
      credit: video.credit,
      thumbnail: video.thumbnail
    }));
  } catch (error) {
    console.error("Error parsing video data:", error);
    return defaultSettings.featured_videos;
  }
};

export const useHomeSettingsData = () => {
  const { setSettings, settings, isSaving, setIsSaving } = useHomeSettings();
  const { toast } = useToast();

  const { isLoading } = useQuery({
    queryKey: ["home-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Convert the Json type to VideoData[] type using our helper function
          const parsedVideos = parseVideoData(data.featured_videos);
          
          setSettings({
            ...data,
            featured_videos: parsedVideos
          } as HomeSettings);
          
          return data;
        }
        
        // If no settings exist, create default settings
        const { data: newData, error: insertError } = await supabase
          .from("home_settings")
          .insert([{
            ...defaultSettings,
            // Convert VideoData[] to a plain array of objects for storage
            featured_videos: defaultSettings.featured_videos
          }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        if (newData) {
          const parsedVideos = parseVideoData(newData.featured_videos);
          
          setSettings({
            ...newData,
            featured_videos: parsedVideos
          } as HomeSettings);
          
          return newData;
        }
        
        return defaultSettings;
      } catch (error) {
        console.error("Error fetching home settings:", error);
        toast({
          title: "Error",
          description: "Failed to load home page settings",
          variant: "destructive",
        });
        return defaultSettings;
      }
    },
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // When saving, ensure we're passing a plain object that can be stored as JSON
      const { error } = await supabase
        .from("home_settings")
        .upsert({
          ...settings,
          // No type conversion needed here as it's already in the correct format for storage
          featured_videos: settings.featured_videos
        })
        .select();
        
      if (error) throw error;
      
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
    settings
  };
};
