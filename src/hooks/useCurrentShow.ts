
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Show {
  id: string;
  title: string;
  personality_id: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  days: string[];
  external_id: string;
  artwork_url: string | null;
}

interface CurrentShow {
  showName: string;
  hostName: string | null;
  artwork: string | null;
  timeSlot: string;
  isLive: boolean;
}

// Helper function to ensure high quality images
const getHighQualityImage = (artworkUrl: string | null): string | null => {
  if (!artworkUrl) return null;
  
  // If it's already a high-quality image, return it as is
  if (artworkUrl.includes("?auto=format&fit=crop&q=")) {
    return artworkUrl;
  }
  
  // If it's an Unsplash image, append quality parameters
  if (artworkUrl.includes("images.unsplash.com")) {
    return `${artworkUrl}${artworkUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&q=100`;
  }
  
  // For radio.co images, get high quality version
  const baseUrl = artworkUrl.split('?')[0];
  return `${baseUrl}?quality=100&width=800&height=800`;
};

// Function to check if a show is currently live
const isShowLiveNow = (show: Show): boolean => {
  const now = new Date();
  const currentDay = format(now, 'EEEE');
  const currentTime = format(now, 'HH:mm:ss');
  
  // Check if the show is scheduled for today
  if (!show.days.includes(currentDay)) {
    return false;
  }
  
  // Parse start and end times
  const startTime = show.start_time;
  const endTime = show.end_time;
  
  // Check if current time is between start and end time
  return currentTime >= startTime && currentTime <= endTime;
};

export const useCurrentShow = () => {
  const [currentShow, setCurrentShow] = useState<CurrentShow | null>(null);
  
  // Fetch shows from our Supabase database
  const fetchShows = async () => {
    const { data, error } = await supabase
      .from("shows")
      .select("*");

    if (error) {
      throw new Error(`Failed to fetch shows: ${error.message}`);
    }

    return data as Show[];
  };

  const { data: shows, isLoading, error } = useQuery({
    queryKey: ["shows"],
    queryFn: fetchShows,
  });

  useEffect(() => {
    if (!shows) return;

    // Find any shows that are currently live
    const liveShows = shows.filter(isShowLiveNow);

    if (liveShows.length > 0) {
      // Take the first live show if multiple are found
      const show = liveShows[0];
      
      setCurrentShow({
        showName: show.title,
        hostName: show.description,
        artwork: getHighQualityImage(show.artwork_url),
        timeSlot: `${formatTime(show.start_time)} - ${formatTime(show.end_time)}`,
        isLive: true
      });
    } else {
      // If no current show, set to null
      setCurrentShow(null);
    }
  }, [shows]);

  // Format time strings from database (HH:mm:ss) to display format (h:mm a)
  const formatTime = (timeString: string) => {
    const date = parse(timeString, "HH:mm:ss", new Date());
    return format(date, "h:mm a");
  };

  return {
    currentShow,
    isLoading,
    error
  };
};
