
import { useState, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { MinimizedPlayer } from "./player/MinimizedPlayer";
import { FullscreenPlayer } from "./player/FullscreenPlayer";
import { DesktopPlayer } from "./player/DesktopPlayer";

const MusicPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    isPlaying,
    volume,
    isMuted,
    metadata,
    togglePlayPause,
    handleVolumeChange,
    toggleMute
  } = useAudioPlayer();

  useEffect(() => {
    if (isPlaying && window.innerWidth < 768) {
      setIsFullscreen(true);
    }
  }, [isPlaying]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePlayPause = () => {
    togglePlayPause();
    if (!isPlaying && window.innerWidth < 768) {
      setIsFullscreen(true);
    }
  };

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div 
        className={`
          fixed transition-all duration-300 ease-in-out z-50
          ${isFullscreen 
            ? 'top-0 left-0 right-0 bottom-0 h-screen' 
            : 'bottom-0 left-0 right-0 h-16 bg-background border-t border-border'
          }
        `}
      >
        {!isFullscreen 
          ? <MinimizedPlayer 
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              metadata={metadata}
              togglePlayPause={handlePlayPause}
              handleVolumeChange={handleVolumeChange}
              toggleMute={toggleMute}
              toggleFullscreen={toggleFullscreen}
            /> 
          : <FullscreenPlayer 
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              metadata={metadata}
              togglePlayPause={handlePlayPause}
              handleVolumeChange={handleVolumeChange}
              toggleMute={toggleMute}
              toggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
            />
        }
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-border shadow-lg z-50">
      <DesktopPlayer
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        metadata={metadata}
        togglePlayPause={handlePlayPause}
        handleVolumeChange={handleVolumeChange}
        toggleMute={toggleMute}
      />
    </div>
  );
};

export default MusicPlayer;
