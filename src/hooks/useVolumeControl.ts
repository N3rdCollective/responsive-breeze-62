
import { useState } from "react";
import { setVolume } from "@/services/audioService";
import { useToast } from "@/components/ui/use-toast";

export const useVolumeControl = () => {
  const [volume, setVolumeState] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState([50]);
  const { toast } = useToast();

  const handleVolumeChange = (newVolume: number[]) => {
    setVolumeState(newVolume);
    setPreviousVolume(newVolume);
    setVolume(newVolume[0]);
    if (newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume[0]);
      setVolumeState(previousVolume);
      setIsMuted(false);
      toast({
        title: "Sound On",
        description: "Audio unmuted",
      });
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setVolumeState([0]);
      setIsMuted(true);
      toast({
        title: "Sound Off",
        description: "Audio muted",
      });
    }
  };

  return {
    volume,
    isMuted,
    handleVolumeChange,
    toggleMute
  };
};
