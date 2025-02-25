
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat,
  Shuffle
} from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  volume?: number[];
  onVolumeChange?: (value: number[]) => void;
  showVolumeSlider?: boolean;
  isFullscreen?: boolean;
}

export const PlayerControls = ({ 
  isPlaying, 
  togglePlayPause,
  volume,
  onVolumeChange,
  showVolumeSlider = false,
  isFullscreen = false
}: PlayerControlsProps) => {
  const [progress] = useState([0]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`flex items-center ${isFullscreen ? 'space-x-8' : 'space-x-4'} mb-1`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <Shuffle size={isFullscreen ? 24 : 20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <SkipBack size={isFullscreen ? 24 : 20} />
        </Button>
        <Button 
          variant={isFullscreen ? "ghost" : "default"}
          size={isFullscreen ? "lg" : "icon"}
          className={`
            rounded-full transition-all duration-300
            ${isFullscreen 
              ? 'h-16 w-16 bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-black shadow-lg'
            }
          `}
          onClick={togglePlayPause}
        >
          {isPlaying ? 
            <Pause size={isFullscreen ? 32 : 20} /> : 
            <Play size={isFullscreen ? 32 : 20} className={isFullscreen ? "ml-1" : ""} />
          }
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <SkipForward size={isFullscreen ? 24 : 20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <Repeat size={isFullscreen ? 24 : 20} />
        </Button>
      </div>
      <div className="w-full flex items-center space-x-2">
        {showVolumeSlider && volume && onVolumeChange ? (
          <Slider
            value={volume}
            onValueChange={onVolumeChange}
            max={100}
            step={1}
            className="w-full"
          />
        ) : (
          <>
            <span className="text-xs text-muted-foreground w-10 text-right">LIVE</span>
            <Slider
              value={progress}
              max={100}
              step={1}
              className="w-full"
              disabled
            />
            <span className="text-xs text-muted-foreground w-10">24/7</span>
          </>
        )}
      </div>
    </div>
  );
};
