
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoData } from '@/components/staff/home/context/HomeSettingsContext';
import { greetings } from '@/data/greetings'; // Removed GreetingData import as it's not used here
import { useAuth } from '@/hooks/useAuth';

const defaultVideoBackgrounds: VideoData[] = [];

export const useHeroData = (videoBackgroundsProp?: VideoData[]) => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null); // New state for profile display name

  useEffect(() => {
    const fetchVideos = async () => {
      if (videoBackgroundsProp && videoBackgroundsProp.length > 0) {
        setVideos(videoBackgroundsProp);
        setIsLoading(false); // Set loading to false only after setting videos
        return;
      }

      try {
        // setIsLoading(true); // Already true by default, ensure it's set if this effect runs multiple times
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

  // Effect to fetch profile display name when user changes
  useEffect(() => {
    if (user?.id) {
      const fetchProfileDisplayName = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile display_name:', error.message);
            setProfileDisplayName(null);
            return;
          }
          
          if (data && data.display_name) {
            setProfileDisplayName(data.display_name);
          } else {
            setProfileDisplayName(null); // Explicitly set to null if not found or empty
          }
        } catch (err) {
          console.error('Exception fetching profile display_name:', err);
          setProfileDisplayName(null);
        }
      };
      fetchProfileDisplayName();
    } else {
      setProfileDisplayName(null); // Reset if no user
    }
  }, [user]);

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
      
      let displayNameToUse = "";
      if (user) {
        if (profileDisplayName) { // Prioritize fetched profile display_name
          displayNameToUse = profileDisplayName;
        } else if (user.user_metadata?.display_name) {
          displayNameToUse = user.user_metadata.display_name;
        } else if (user.user_metadata?.username) {
          displayNameToUse = user.user_metadata.username;
        } else if (user.user_metadata?.name) { // Fallback to 'name' from metadata
          displayNameToUse = user.user_metadata.name;
        } else if (user.email) {
          displayNameToUse = user.email.split('@')[0];
        }
      }

      if (displayNameToUse) {
        return `${slang}! ${timeGreeting}, ${displayNameToUse}!`;
      }
      return `${slang}! ${timeGreeting}`;
    };

    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, [location, user, profileDisplayName, greetings]); // Added profileDisplayName and greetings as dependencies

  return { location, greeting, videos, currentVideoIndex, isLoading };
};
