
import { useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { PlayerControls } from "@/components/player/PlayerControls";
import { VolumeControl } from "@/components/player/VolumeControl";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const MusicPlayer = () => {
  const {
    isPlaying,
    volume,
    isMuted,
    metadata,
    togglePlayPause,
    handleVolumeChange,
    toggleMute
  } = useAudioPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Currently Playing */}
          <div className="flex items-center space-x-4 w-1/4">
            <div className="w-12 h-12 bg-muted rounded-md overflow-hidden">
              <AspectRatio ratio={1/1} className="relative">
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
            <div className="hidden sm:block overflow-hidden">
              <div className="group relative w-48">
                <h4 className="text-sm font-medium text-primary whitespace-nowrap group-hover:animate-[marquee_10s_linear_infinite]">
                  {metadata.title}
                </h4>
                {metadata.artist && (
                  <p className="text-xs text-muted-foreground whitespace-nowrap group-hover:animate-[marquee_10s_linear_infinite]">
                    {metadata.artist}
                  </p>
                )}
              </div>
            </div>
          </div>

          <PlayerControls 
            isPlaying={isPlaying} 
            togglePlayPause={togglePlayPause} 
          />

          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
