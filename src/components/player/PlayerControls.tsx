
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
}

export const PlayerControls = ({ 
  isPlaying, 
  togglePlayPause,
  volume,
  onVolumeChange,
  showVolumeSlider = false
}: PlayerControlsProps) => {
  const [progress] = useState([0]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center space-x-4 mb-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <Shuffle size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <SkipBack size={20} />
        </Button>
        <Button 
          variant="default" 
          size="icon" 
          className="rounded-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-black shadow-lg"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <SkipForward size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary"
          disabled
        >
          <Repeat size={20} />
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
