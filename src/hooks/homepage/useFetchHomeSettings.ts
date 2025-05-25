
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HomeSettings as OriginalHomeSettings, defaultSettings as originalDefaultSettings } from "@/components/staff/home/context/HomeSettingsContext";

export type HomeSettings = OriginalHomeSettings;
const defaultSettings: HomeSettings = originalDefaultSettings;

interface UseFetchHomeSettingsReturn {
  settings: HomeSettings;
  isLoading: boolean;
}

export const useFetchHomeSettings = (): UseFetchHomeSettingsReturn => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from("home_settings")
          .select("*")
          .maybeSingle();

        if (settingsError) {
          console.error("Error fetching home settings:", settingsError);
          setSettings(defaultSettings); // Fallback to default on error
        } else if (settingsData) {
          setSettings({ ...defaultSettings, ...settingsData } as HomeSettings);
        } else {
          setSettings(defaultSettings); // Fallback if no data
        }
      } catch (error) {
        console.error("Error in fetchSettings:", error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};
