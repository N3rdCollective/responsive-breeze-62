
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MoreHorizontal, Star, SkipBack, Play, Pause, SkipForward, ChevronDown } from "lucide-react";
import { PlayerControls } from "./PlayerControls";
import { VolumeControl } from "./VolumeControl";
import { StreamMetadata } from "@/types/player";
import { Slider } from "@/components/ui/slider";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface FullscreenPlayerProps {
  isPlaying: boolean;
  volume: number[];
  isMuted: boolean;
  metadata: StreamMetadata;
  togglePlayPause: () => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const FullscreenPlayer = ({
  isPlaying,
  volume,
  isMuted,
  metadata,
  togglePlayPause,
  handleVolumeChange,
  toggleMute,
  toggleFullscreen
}: FullscreenPlayerProps) => {
  const isMobile = window.innerWidth < 768;
  const [shouldScroll, setShouldScroll] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (titleRef.current) {
      setShouldScroll(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [metadata.title]);
  
  return (
    <div className={`h-full flex flex-col justify-between py-8 px-6 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-[#1A1F2C] to-[#121520] text-white'
        : 'bg-gradient-to-b from-[#F1F0FB] to-[#E6E4F0] text-foreground'
    }`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className={`absolute top-4 right-4 ${
          theme === 'dark' 
            ? 'text-white/60 hover:text-white' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <ChevronDown size={24} />
      </Button>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-[85vw] h-[85vw] max-w-[400px] max-h-[400px] rounded-lg overflow-hidden shadow-lg">
          <AspectRatio ratio={1/1}>
            <img
              src={metadata.artwork}
              alt="Album Art"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05";
              }}
            />
          </AspectRatio>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="relative overflow-hidden">
              <h2 
                ref={titleRef}
                className={`text-2xl font-semibold whitespace-nowrap ${
                  shouldScroll ? 'animate-marquee' : 'truncate'
                }`}
              >
                {metadata.title}
              </h2>
            </div>
            {metadata.artist && (
              <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-muted-foreground'} truncate`}>
                {metadata.artist}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'}
            >
              <Star size={24} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'}
            >
              <MoreHorizontal size={24} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Slider
            value={[0]}
            max={100}
            step={1}
            className="w-full"
            disabled
          />
          <div className={`flex justify-between text-sm ${
            theme === 'dark' ? 'text-white/40' : 'text-muted-foreground'
          }`}>
            <span>LIVE</span>
            <span>24/7</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`w-16 h-16 ${
              theme === 'dark' 
                ? 'text-white/60 hover:text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            disabled
          >
            <SkipBack size={32} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`w-20 h-20 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause size={40} />
            ) : (
              <Play size={40} className="ml-2" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`w-16 h-16 ${
              theme === 'dark' 
                ? 'text-white/60 hover:text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            disabled
          >
            <SkipForward size={32} />
          </Button>
        </div>

        {isMobile && (
          <div className="pt-2">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />
          </div>
        )}
      </div>
    </div>
  );
};
