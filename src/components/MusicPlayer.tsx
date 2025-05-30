
import { useState, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { MinimizedPlayer } from "./player/MinimizedPlayer";
import { FullscreenPlayer } from "./player/FullscreenPlayer";
import { DesktopPlayer } from "./player/DesktopPlayer";
import { useIsMobile } from "@/hooks/use-mobile";

const MusicPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    isPlaying,
    volume,
    isMuted,
    metadata,
    togglePlayPause,
    handleVolumeChange,
    toggleMute
  } = useAudioPlayer();

  // Debug player state
  useEffect(() => {
    console.log("MusicPlayer component rendered", { isPlaying, isMobile, isFullscreen });
  }, [isPlaying, isMobile, isFullscreen]);

  useEffect(() => {
    if (isPlaying && isMobile) {
      setIsFullscreen(true);
    }
  }, [isPlaying, isMobile]);

  useEffect(() => {
    const body = document.body;
    const navbar = document.querySelector('nav');
    
    if (body) {
      if (isMobile && !isFullscreen) {
        body.style.paddingBottom = "64px"; // Add padding for mobile minimized player
      } else if (!isMobile) {
        body.style.paddingBottom = "80px"; // Add padding for desktop player
      } else {
        body.style.paddingBottom = "0";
      }
    }
    
    // Hide/show navbar based on fullscreen state
    if (navbar) {
      if (isMobile && isFullscreen) {
        navbar.style.display = 'none';
      } else {
        navbar.style.display = 'block';
      }
    }
    
    return () => {
      if (body) {
        body.style.paddingBottom = "0";
      }
      // Restore navbar visibility on component unmount
      if (navbar) {
        navbar.style.display = 'block';
      }
    };
  }, [isFullscreen, isMobile]);

  const toggleFullscreen = () => {
    console.log("Toggling fullscreen state:", !isFullscreen);
    setIsFullscreen(!isFullscreen);
  };

  const handlePlayPause = () => {
    console.log("Player play/pause triggered, current state:", isPlaying);
    togglePlayPause();
    if (!isPlaying && isMobile) {
      setIsFullscreen(true);
    }
  };

  if (isMobile) {
    return (
      <div 
        id="music-player-container"
        className={`
          fixed transition-all duration-300 z-50
          ${isFullscreen 
            ? 'top-0 left-0 right-0 bottom-0 h-screen' 
            : 'bottom-0 left-0 right-0 h-14 sm:h-16 bg-background border-t border-border'
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

  console.log("Rendering desktop player");
  
  // For desktop view
  return (
    <div 
      id="desktop-music-player"
      className="fixed bottom-0 left-0 right-0 w-full h-16 sm:h-20 bg-background border-t border-border shadow-lg z-50"
    >
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
