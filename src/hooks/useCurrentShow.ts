
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

interface ShowItem {
  start: string;
  end: string;
  playlist: {
    name: string;
    colour: string;
    artist: string;
    title: string;
    artwork: string | null;
  };
}

interface CurrentShow {
  showName: string;
  hostName: string | null;
  artwork: string | null;
  timeSlot: string;
  isLive: boolean;
}

const fetchSchedule = async () => {
  const response = await fetch("https://public.radio.co/stations/s1a36378a0/embed/schedule");
  if (!response.ok) {
    throw new Error("Failed to fetch schedule");
  }
  const data = await response.json();
  return data.data as ShowItem[];
};

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
  
  return artworkUrl;
};

export const useCurrentShow = () => {
  const [currentShow, setCurrentShow] = useState<CurrentShow | null>(null);
  
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  useEffect(() => {
    if (!schedule) return;

    // Determine current show based on day and time
    const now = new Date();
    const currentDay = format(now, 'EEEE');
    const currentTime = format(now, 'HH:mm');

    // Filter the schedule for shows happening now
    const currentShows = schedule.filter(item => {
      const itemDate = parseISO(item.start);
      const itemDay = format(itemDate, 'EEEE');
      
      if (itemDay !== currentDay) return false;

      const startTime = format(parseISO(item.start), 'HH:mm');
      const endTime = format(parseISO(item.end), 'HH:mm');
      
      return currentTime >= startTime && currentTime <= endTime;
    });

    if (currentShows.length > 0) {
      const show = currentShows[0];
      setCurrentShow({
        showName: show.playlist.name,
        hostName: show.playlist.artist || null,
        artwork: getHighQualityImage(show.playlist.artwork),
        timeSlot: `${format(parseISO(show.start), 'h:mm a')} - ${format(parseISO(show.end), 'h:mm a')}`,
        isLive: true
      });
    } else {
      // If no current show, set to null or a default message
      setCurrentShow(null);
    }
  }, [schedule]);

  return {
    currentShow,
    isLoading,
    error
  };
};
