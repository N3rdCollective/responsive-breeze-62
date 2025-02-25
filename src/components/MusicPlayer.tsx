
import { useState, useEffect } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { PlayerControls } from "@/components/player/PlayerControls";
import { VolumeControl } from "@/components/player/VolumeControl";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

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

  // Update fullscreen state when playback starts
  useEffect(() => {
    if (isPlaying && window.innerWidth < 768) { // 768px is the 'md' breakpoint in Tailwind
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
      fixed transition-all duration-300 bg-background border-t border-border shadow-lg z-50
      ${isFullscreen 
        ? 'top-0 left-0 right-0 bottom-0 h-screen' 
        : 'bottom-0 left-0 right-0'
      }
    `}>
      <div className={`
        max-w-7xl mx-auto px-4 
        ${isFullscreen 
          ? 'h-full flex flex-col justify-between py-8' 
          : 'py-3'
        }
      `}>
        <div className={`
          ${isFullscreen 
            ? 'flex flex-col h-full' 
            : 'flex items-center justify-between'
          }
        `}>
          {/* Mobile Fullscreen Toggle */}
          <div className="md:hidden absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-primary"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </Button>
          </div>

          {/* Album Art and Track Info */}
          <div className={`
            flex 
            ${isFullscreen 
              ? 'flex-col items-center justify-center flex-grow space-y-6' 
              : 'items-center space-x-4 w-1/4'
            }
          `}>
            <div className={`
              ${isFullscreen ? 'w-64 h-64' : 'w-12 h-12'} 
              bg-muted rounded-md overflow-hidden
            `}>
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
            <div className={`
              ${isFullscreen ? 'text-center' : 'hidden sm:block'} 
              overflow-hidden
            `}>
              <div className="group relative w-48">
                <h4 className={`
                  font-medium text-primary whitespace-nowrap 
                  group-hover:animate-[marquee_10s_linear_infinite]
                  ${isFullscreen ? 'text-xl mb-2' : 'text-sm'}
                `}>
                  {metadata.title}
                </h4>
                {metadata.artist && (
                  <p className={`
                    text-muted-foreground whitespace-nowrap 
                    group-hover:animate-[marquee_10s_linear_infinite]
                    ${isFullscreen ? 'text-base' : 'text-xs'}
                  `}>
                    {metadata.artist}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className={`
            ${isFullscreen ? 'w-full max-w-md mx-auto' : 'w-2/4'}
          `}>
            <PlayerControls 
              isPlaying={isPlaying} 
              togglePlayPause={handlePlayPause} 
            />
          </div>

          {/* Volume Control */}
          <div className={`
            ${isFullscreen ? 'w-full max-w-md mx-auto mt-6' : ''}
          `}>
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
