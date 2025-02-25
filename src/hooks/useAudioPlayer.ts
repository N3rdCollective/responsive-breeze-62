
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { StreamMetadata } from "@/types/player";
import { STREAM_URL, METADATA_URL } from "@/constants/stream";

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState([50]);
  const [metadata, setMetadata] = useState<StreamMetadata>({ title: "Rappin' Lounge Radio" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataIntervalRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume[0] / 100;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(METADATA_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setMetadata({
              title: data.data.title || "Rappin' Lounge Radio",
              artist: data.data.artist
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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        toast({
          description: "Stream paused",
        });
      } else {
        audioRef.current.play().catch((error) => {
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
      setIsPlaying(!isPlaying);
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
      } else {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
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
