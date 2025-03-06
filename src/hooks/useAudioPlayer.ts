
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { StreamMetadata } from "@/types/player";
import { STREAM_URL, METADATA_URL } from "@/constants/stream";

const DEFAULT_ARTWORK = "/lovable-uploads/12fe363a-3bad-45f9-8212-66621f85b9ac.png";

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState([50]);
  const [metadata, setMetadata] = useState<StreamMetadata>({ 
    title: "Rappin' Lounge Radio",
    artwork: DEFAULT_ARTWORK
  });
  const metadataIntervalRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(METADATA_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setMetadata({
              title: data.data.title || "Rappin' Lounge Radio",
              artist: data.data.artist,
              artwork: data.data.artwork_urls?.large || 
                       data.data.artwork_urls?.standard || 
                       DEFAULT_ARTWORK
            });
            console.log("New metadata:", data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
    metadataIntervalRef.current = window.setInterval(fetchMetadata, 30000);

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
      // Clean up audio element when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const showMobileNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('Now Playing: Rappin\' Lounge Radio', {
          body: `${metadata.title}${metadata.artist ? ` - ${metadata.artist}` : ''}`,
          icon: metadata.artwork || DEFAULT_ARTWORK
        });
        
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      // Stop the stream completely
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      setIsPlaying(false);
      toast({
        title: "Stopped",
        description: "Stream stopped",
      });
    } else {
      // Create a new audio element and load the stream
      audioRef.current = new Audio(STREAM_URL);
      
      // Apply current volume settings
      audioRef.current.volume = volume[0] / 100;
      
      // Start playing
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error);
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to start playback. Please try again.",
        });
      });
      
      setIsPlaying(true);
      toast({
        title: "Now Playing: Rappin' Lounge Radio",
        description: `${metadata.title}${metadata.artist ? ` - ${metadata.artist}` : ''}`,
      });
      
      showMobileNotification();
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    setPreviousVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    if (newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume[0] / 100;
        setVolume(previousVolume);
        setIsMuted(false);
        toast({
          title: "Sound On",
          description: "Audio unmuted",
        });
      } else {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
        setVolume([0]);
        setIsMuted(true);
        toast({
          title: "Sound Off",
          description: "Audio muted",
        });
      }
    }
  };

  return {
    isPlaying,
    volume,
    isMuted,
    metadata,
    togglePlayPause,
    handleVolumeChange,
    toggleMute
  };
};
