
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { VolumeControl } from "./VolumeControl";
import { StreamMetadata } from "@/types/player";

interface MinimizedPlayerProps {
  isPlaying: boolean;
  volume: number[];
  isMuted: boolean;
  metadata: StreamMetadata;
  togglePlayPause: () => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

export const MinimizedPlayer = ({
  isPlaying,
  volume,
  isMuted,
  togglePlayPause,
  handleVolumeChange,
  toggleMute
}: MinimizedPlayerProps) => {
  return (
    <div className="flex items-center justify-between px-4 h-full">
      <Button 
        variant="default" 
        size="icon" 
        className="rounded-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-black shadow-lg"
        onClick={togglePlayPause}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      <VolumeControl
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
      />
    </div>
  );
};
