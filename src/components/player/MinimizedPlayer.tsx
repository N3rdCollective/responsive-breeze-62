
import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize2 } from "lucide-react";
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
  metadata,
  togglePlayPause,
  handleVolumeChange,
  toggleMute,
  toggleFullscreen
}: MinimizedPlayerProps) => {
  return (
    <div className="flex items-center justify-between px-4 h-full">
      <div className="flex items-center gap-3">
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-black shadow-lg"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <div className="max-w-[150px]">
          <p className="text-sm font-medium truncate">{metadata.title}</p>
          {metadata.artist && (
            <p className="text-xs text-muted-foreground truncate">{metadata.artist}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="text-muted-foreground hover:text-primary"
        >
          <Maximize2 size={20} />
        </Button>
      </div>
    </div>
  );
};
