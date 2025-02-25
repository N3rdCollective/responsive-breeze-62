import { useState, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { MinimizedPlayer } from "./player/MinimizedPlayer";
import { FullscreenPlayer } from "./player/FullscreenPlayer";

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

  return (
    <div className={`
      fixed transition-all duration-300 border-t border-border shadow-lg z-50
      ${isFullscreen 
        ? 'top-0 left-0 right-0 bottom-0 h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background/95 to-background/90 backdrop-blur-2xl' 
        : 'bottom-0 left-0 right-0 h-16 md:h-20 bg-background'
      }
    `}>
      {(!isFullscreen && window.innerWidth < 768) 
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
};

export default MusicPlayer;
