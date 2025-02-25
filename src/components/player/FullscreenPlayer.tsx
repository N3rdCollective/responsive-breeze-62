
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Minimize2 } from "lucide-react";
import { PlayerControls } from "./PlayerControls";
import { VolumeControl } from "./VolumeControl";
import { StreamMetadata } from "@/types/player";

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
  toggleFullscreen,
  isFullscreen
}: FullscreenPlayerProps) => {
  const isMobile = window.innerWidth < 768;
  
  return (
    <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-between py-8">
      <div className="h-full flex flex-col justify-between">
        {/* Top Bar with Close Button */}
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white/60 hover:text-white -ml-2"
          >
            <Minimize2 size={24} />
          </Button>
        </div>

        {/* Album Art and Track Info */}
        <div className="flex flex-col items-center justify-center flex-grow space-y-12">
          <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <AspectRatio ratio={1/1} className="relative bg-black/20">
              <img
                src={metadata.artwork}
                alt="Album Art"
                className="object-cover w-full h-full scale-105 transition-transform duration-500 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05";
                }}
              />
            </AspectRatio>
          </div>
          <div className="text-center space-y-3 w-full max-w-lg px-4">
            <div className="group relative">
              <h4 className="font-medium truncate text-3xl md:text-4xl text-white mb-4 hover:underline cursor-pointer">
                {metadata.title}
              </h4>
              {metadata.artist && (
                <p className="truncate text-xl md:text-2xl text-white/60 hover:text-white hover:underline cursor-pointer transition-colors">
                  {metadata.artist}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls Section */}
        <div className="space-y-6 w-full max-w-xl mx-auto">
          {/* Player Controls */}
          <div className="w-full">
            <PlayerControls 
              isPlaying={isPlaying} 
              togglePlayPause={togglePlayPause}
              volume={isMobile ? volume : undefined}
              onVolumeChange={isMobile ? handleVolumeChange : undefined}
              showVolumeSlider={isMobile}
              isFullscreen={true}
            />
          </div>

          {/* Volume Control - Hide in mobile fullscreen */}
          {!isMobile && (
            <div className="w-full max-w-md mx-auto">
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
    </div>
  );
};
