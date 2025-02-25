
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
      fixed transition-all duration-300 bg-background border-t border-border shadow-lg z-50
      ${isFullscreen 
        ? 'top-0 left-0 right-0 bottom-0 h-screen bg-gradient-to-b from-background to-background/80 backdrop-blur-lg' 
        : 'bottom-0 left-0 right-0 h-20'
      }
    `}>
      <div className={`
        max-w-7xl mx-auto px-4 h-full
        ${isFullscreen 
          ? 'flex flex-col justify-between py-8' 
          : 'h-full'
        }
      `}>
        <div className={`
          h-full
          ${isFullscreen 
            ? 'flex flex-col justify-between' 
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
            flex items-center
            ${isFullscreen 
              ? 'flex-col justify-center flex-grow space-y-8' 
              : 'space-x-4 w-[30%]'
            }
          `}>
            <div className={`
              ${isFullscreen ? 'w-64 h-64' : 'w-14 h-14'} 
              rounded-md overflow-hidden shadow-lg
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
              ${isFullscreen ? 'text-center' : ''} 
              flex-1 min-w-0
            `}>
              <div className="group relative">
                <h4 className={`
                  font-medium text-foreground truncate
                  ${isFullscreen ? 'text-2xl mb-3' : 'text-sm'}
                `}>
                  {metadata.title}
                </h4>
                {metadata.artist && (
                  <p className={`
                    text-muted-foreground truncate
                    ${isFullscreen ? 'text-lg' : 'text-xs'}
                  `}>
                    {metadata.artist}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className={`
            ${isFullscreen 
              ? 'w-full max-w-lg mx-auto mb-8' 
              : 'w-[40%] max-w-md'
            }
          `}>
            <PlayerControls 
              isPlaying={isPlaying} 
              togglePlayPause={handlePlayPause} 
            />
          </div>

          {/* Volume Control */}
          <div className={`
            ${isFullscreen 
              ? 'w-full max-w-md mx-auto mb-4' 
              : 'w-[30%] flex justify-end'
            }
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
