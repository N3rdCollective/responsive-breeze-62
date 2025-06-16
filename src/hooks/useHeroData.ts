import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoData } from '@/components/staff/home/context/HomeSettingsContext';
import { greetings } from '@/data/greetings';
import { useAuth } from '@/hooks/useAuth';

const defaultVideoBackgrounds: VideoData[] = [];

export const useHeroData = (videoBackgroundsProp?: VideoData[]) => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);

  console.log('🏠 useHeroData: Hook initialized', { 
    user: user?.id, 
    videoBackgroundsProp: videoBackgroundsProp?.length 
  });

  useEffect(() => {
    const fetchVideos = async () => {
      if (videoBackgroundsProp && videoBackgroundsProp.length > 0) {
        console.log('🏠 useHeroData: Using provided videos', videoBackgroundsProp.length);
        setVideos(videoBackgroundsProp);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🏠 useHeroData: Fetching videos from database');
        const { data, error } = await supabase
          .from("featured_videos")
          .select("*")
          .order("display_order", { ascending: true })
          .eq("is_active", true);

        if (error) {
          console.error('🏠 useHeroData: Error fetching videos:', error);
          throw error;
        }
        
        console.log('🏠 useHeroData: Videos fetched successfully', data?.length || 0);
        setVideos(data || defaultVideoBackgrounds);
      } catch (error) {
        console.error("🏠 useHeroData: Error fetching featured videos:", error);
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
        console.log('🏠 useHeroData: Fetching user location');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.region_code && data.country_code) {
          const locationKey = `${data.country_code}-${data.region_code}`;
          console.log('🏠 useHeroData: Location detected:', locationKey);
          setLocation(locationKey);
        }
      } catch (error) {
        console.log('🏠 useHeroData: Error fetching location:', error);
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
          console.log('🏠 useHeroData: Fetching profile display_name for user:', user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('🏠 useHeroData: Error fetching profile display_name:', error.message);
            setProfileDisplayName(null);
            return;
          }
          
          const displayName = data?.display_name || null;
          console.log('🏠 useHeroData: Profile display_name fetched:', displayName);
          setProfileDisplayName(displayName);
        } catch (err) {
          console.error('🏠 useHeroData: Exception fetching profile display_name:', err);
          setProfileDisplayName(null);
        }
      };
      fetchProfileDisplayName();
    } else {
      setProfileDisplayName(null);
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  useEffect(() => {
    if (videos.length === 0 && !isLoading) return;
    if (videos.length <= 1) return;
    
    const videoRotationInterval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 45000);

    return () => clearInterval(videoRotationInterval);
  }, [videos.length, isLoading]);

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
        if (profileDisplayName) {
          displayNameToUse = profileDisplayName;
        } else if (user.user_metadata?.display_name) {
          displayNameToUse = user.user_metadata.display_name;
        } else if (user.user_metadata?.username) {
          displayNameToUse = user.user_metadata.username;
        } else if (user.user_metadata?.name) {
          displayNameToUse = user.user_metadata.name;
        } else if (user.email) {
          displayNameToUse = user.email.split('@')[0];
        }
      }

      const newGreeting = displayNameToUse 
        ? `${slang}! ${timeGreeting}, ${displayNameToUse}!`
        : `${slang}! ${timeGreeting}`;
      
      console.log('🏠 useHeroData: Generated greeting:', newGreeting);
      return newGreeting;
    };

    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, [location, user?.id, user?.email, user?.user_metadata?.display_name, user?.user_metadata?.username, user?.user_metadata?.name, profileDisplayName]);

  return { location, greeting, videos, currentVideoIndex, isLoading };
};
