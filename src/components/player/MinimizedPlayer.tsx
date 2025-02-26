
import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize2 } from "lucide-react";
import { VolumeControl } from "./VolumeControl";
import { StreamMetadata } from "@/types/player";
import { useEffect, useRef, useState } from "react";

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
  const [shouldScroll, setShouldScroll] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      setShouldScroll(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [metadata.title]);

  return (
    <div className="flex items-center justify-between px-4 h-full">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-black shadow-lg flex-shrink-0"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="relative overflow-hidden">
            <p 
              ref={titleRef}
              className={`text-sm font-medium whitespace-nowrap ${
                shouldScroll ? 'animate-marquee' : 'truncate'
              }`}
            >
              {metadata.title}
            </p>
          </div>
          {metadata.artist && (
            <p className="text-xs text-muted-foreground truncate">
              {metadata.artist}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
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
