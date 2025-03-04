
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HomeSettings, defaultSettings, useHomeSettings } from "../context/HomeSettingsContext";

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
          // Ensure featured_videos exists and is valid
          if (!data.featured_videos || !Array.isArray(data.featured_videos)) {
            data.featured_videos = defaultSettings.featured_videos;
          }
          
          setSettings(data as HomeSettings);
          return data;
        }
        
        // If no settings exist, create default settings
        const { data: newData, error: insertError } = await supabase
          .from("home_settings")
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        if (newData) {
          setSettings(newData as HomeSettings);
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
      const { error } = await supabase
        .from("home_settings")
        .upsert(settings)
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
