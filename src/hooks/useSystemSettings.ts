
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SystemSettings, SystemSettingsFormValues } from '@/types/settings';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching system settings:', error);
        toast({
          title: "Error",
          description: "Failed to load system settings.",
          variant: "destructive",
        });
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (values: SystemSettingsFormValues) => {
    if (!settings?.id) {
      toast({
        title: "Error",
        description: "No settings found to update.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('system_settings')
        .update({
          site_title: values.site_title,
          site_tagline: values.site_tagline,
          contact_email: values.contact_email || null,
          contact_phone: values.contact_phone || null,
          social_media_links: values.social_media_links,
          copyright_text: values.copyright_text,
          language: values.language,
          time_zone: values.time_zone
        })
        .eq('id', settings.id);

      if (error) {
        console.error('Error updating system settings:', error);
        toast({
          title: "Error",
          description: "Failed to update system settings.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "System settings updated successfully.",
      });
      
      // Refresh the settings
      fetchSettings();
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    refreshSettings: fetchSettings
  };
};
