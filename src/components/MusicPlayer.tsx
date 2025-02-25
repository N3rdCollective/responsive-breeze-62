
import { useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { PlayerControls } from "@/components/player/PlayerControls";
import { VolumeControl } from "@/components/player/VolumeControl";

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
            <div className="w-12 h-12 bg-muted rounded">
              {/* Album art would go here */}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-sm font-medium text-primary truncate">{metadata.title}</h4>
              <p className="text-xs text-muted-foreground">
                {metadata.artist || "Live Stream"}
              </p>
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
