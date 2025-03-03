
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat,
  Shuffle
} from "lucide-react";

interface PlayButtonsProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  isFullscreen?: boolean;
}

export const PlayButtons = ({ 
  isPlaying, 
  togglePlayPause,
  isFullscreen = false
}: PlayButtonsProps) => {
  return (
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
  );
};
