import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { StreamMetadata } from "@/types/player";
import { STREAM_URL, METADATA_URL } from "@/constants/stream";

let audioInstance: HTMLAudioElement | null = null;

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState([50]);
  const [metadata, setMetadata] = useState<StreamMetadata>({ 
    title: "Rappin' Lounge Radio",
    artwork: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05"
  });
  const metadataIntervalRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    if (!audioInstance) {
      audioInstance = new Audio(STREAM_URL);
      audioInstance.volume = volume[0] / 100;
    }

    const audioRef = audioInstance;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audioRef.addEventListener('play', handlePlay);
    audioRef.addEventListener('pause', handlePause);

    const fetchMetadata = async () => {
      try {
        const response = await fetch(METADATA_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setMetadata({
              title: data.data.title || "Rappin' Lounge Radio",
              artist: data.data.artist,
              artwork: data.data.artwork_urls?.large || data.data.artwork_urls?.standard || "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05"
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
      audioRef.removeEventListener('play', handlePlay);
      audioRef.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioInstance) {
      if (isPlaying) {
        audioInstance.pause();
        toast({
          description: "Stream paused",
        });
      } else {
        audioInstance.play().catch((error) => {
          console.error("Playback failed:", error);
          toast({
            variant: "destructive",
            description: "Failed to start playback. Please try again.",
          });
        });
        toast({
          description: `Now streaming: ${metadata.title}`,
        });
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    setPreviousVolume(newVolume);
    if (audioInstance) {
      audioInstance.volume = newVolume[0] / 100;
    }
    if (newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioInstance) {
      if (isMuted) {
        audioInstance.volume = previousVolume[0] / 100;
        setVolume(previousVolume);
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        audioInstance.volume = 0;
        setVolume([0]);
        setIsMuted(true);
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
