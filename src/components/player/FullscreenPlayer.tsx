
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MoreHorizontal, Star, SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { PlayerControls } from "./PlayerControls";
import { VolumeControl } from "./VolumeControl";
import { StreamMetadata } from "@/types/player";
import { Slider } from "@/components/ui/slider";
import { useEffect, useRef, useState } from "react";

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
  toggleMute
}: FullscreenPlayerProps) => {
  const isMobile = window.innerWidth < 768;
  const [shouldScroll, setShouldScroll] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      setShouldScroll(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [metadata.title]);
  
  return (
    <div className="h-full bg-gradient-to-b from-[#4A1E1C] to-[#2A110F] flex flex-col justify-between py-8 px-6">
      {/* Album Art Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[85vw] h-[85vw] max-w-[400px] max-h-[400px] rounded-lg overflow-hidden">
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

      {/* Track Info and Controls */}
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 
              ref={titleRef}
              className={`text-2xl font-semibold text-white whitespace-nowrap ${
                shouldScroll ? 'animate-[marquee_10s_linear_infinite]' : 'truncate'
              }`}
              style={{
                ...(shouldScroll ? {
                  animation: 'marquee 10s linear infinite',
                  paddingLeft: '100%',
                  display: 'inline-block'
                } : {})
              }}
            >
              {metadata.title}
            </h2>
            {metadata.artist && (
              <p className="text-lg text-white/60 truncate">
                {metadata.artist}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <Star size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <MoreHorizontal size={24} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[0]}
            max={100}
            step={1}
            className="w-full"
            disabled
          />
          <div className="flex justify-between text-sm text-white/40">
            <span>LIVE</span>
            <span>24/7</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white w-16 h-16"
            disabled
          >
            <SkipBack size={32} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white w-20 h-20"
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
            className="text-white/60 hover:text-white w-16 h-16"
            disabled
          >
            <SkipForward size={32} />
          </Button>
        </div>

        {/* Volume Slider */}
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
