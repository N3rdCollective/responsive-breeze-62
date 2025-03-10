
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useStreamMetadata } from "./useStreamMetadata";
import { useVolumeControl } from "./useVolumeControl";
import { 
  registerListener, 
  getIsPlaying, 
  getIsUsingBackupStream,
  startPlayback, 
  stopPlayback, 
  setVolume
} from "@/services/audioService";

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(getIsPlaying());
  const { metadata, showMobileNotification } = useStreamMetadata();
  const { volume, isMuted, handleVolumeChange, toggleMute } = useVolumeControl();
  const { toast } = useToast();

  useEffect(() => {
    // Add listener to this component
    const unregister = registerListener(() => {
      setIsPlaying(getIsPlaying());
    });

    // Apply current volume settings on mount
    setVolume(volume[0]);

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    return unregister;
  }, [volume]);

  const togglePlayPause = async () => {
    if (isPlaying) {
      // Stop the stream
      stopPlayback();
      
      toast({
        title: "Stopped",
        description: "Stream stopped",
      });
    } else {
      // Start playback
      const success = await startPlayback(volume[0]);
      
      if (success) {
        toast({
          title: `Now Playing: Rappin' Lounge Radio${getIsUsingBackupStream() ? " (Backup Stream)" : ""}`,
          description: `${metadata.title}${metadata.artist ? ` - ${metadata.artist}` : ''}`,
        });
        
        showMobileNotification();
      } else {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to start playback. Please try again later.",
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
