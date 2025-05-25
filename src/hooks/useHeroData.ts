import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoData } from '@/components/staff/home/context/HomeSettingsContext'; // Assuming this type is globally useful
import { greetings, GreetingData } from '@/data/greetings';

const defaultVideoBackgrounds: VideoData[] = [];

export const useHeroData = (videoBackgroundsProp?: VideoData[]) => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      if (videoBackgroundsProp && videoBackgroundsProp.length > 0) {
        setVideos(videoBackgroundsProp);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);

        if (error) throw error;
        setVideos(data || defaultVideoBackgrounds);
      } catch (error) {
        console.error("Error fetching featured videos:", error);
        setVideos(defaultVideoBackgrounds);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [videoBackgroundsProp]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.region_code && data.country_code) {
          setLocation(`${data.country_code}-${data.region_code}`);
        }
      } catch (error) {
        console.log('Error fetching location:', error);
        // Keep default location on error
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (videos.length === 0 && !isLoading) return;
    if (videos.length <= 1) return;
    
    const videoRotationInterval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 45000);

    return () => clearInterval(videoRotationInterval);
  }, [videos, isLoading]);

  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      const locationData = greetings[location] || greetings.default;
      const slang = locationData.slang.length > 0 
        ? locationData.slang[Math.floor(Math.random() * locationData.slang.length)]
        : "Hey";
      
      let timeGreeting;
      if (hour < 12) timeGreeting = locationData.morning;
      else if (hour < 17) timeGreeting = locationData.afternoon;
      else timeGreeting = locationData.evening;
      
      return `${slang}! ${timeGreeting}`;
    };

    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, [location]);

  return { location, greeting, videos, currentVideoIndex, isLoading };
};
