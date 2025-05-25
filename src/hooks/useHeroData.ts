
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoData } from '@/components/staff/home/context/HomeSettingsContext'; // Assuming this type is globally useful
import { greetings, GreetingData } from '@/data/greetings';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

const defaultVideoBackgrounds: VideoData[] = [];

export const useHeroData = (videoBackgroundsProp?: VideoData[]) => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Get user from useAuth

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
      
      let displayName = "";
      if (user) {
        // Try to get a displayable name from user_metadata or fallback to email
        if (user.user_metadata?.display_name) {
          displayName = user.user_metadata.display_name;
        } else if (user.user_metadata?.username) {
          displayName = user.user_metadata.username;
        } else if (user.user_metadata?.name) {
          displayName = user.user_metadata.name;
        } else if (user.email) {
          displayName = user.email.split('@')[0];
        }
      }

      if (displayName) {
        return `${slang}! ${timeGreeting}, ${displayName}!`;
      }
      return `${slang}! ${timeGreeting}`;
    };

    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    updateGreeting(); // Update greeting immediately
    const interval = setInterval(updateGreeting, 60000); // And then every minute

    return () => clearInterval(interval);
  }, [location, user]); // Add user as a dependency

  return { location, greeting, videos, currentVideoIndex, isLoading };
};

