
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useTheme } from "next-themes";

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  theme?: string;
}

export const PlaybackControls = ({ isPlaying, togglePlayPause, theme }: PlaybackControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        size="icon"
        className={`w-16 h-16 ${
          theme === 'dark' 
            ? 'text-white/60 hover:text-white' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        disabled
      >
        <SkipBack size={32} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`w-20 h-20 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}
        onClick={togglePlayPause}
      >
        {isPlaying ? (
          <Pause size={40} />
        ) : (
          <Play size={40} className="ml-2" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`w-16 h-16 ${
          theme === 'dark' 
            ? 'text-white/60 hover:text-white' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        disabled
      >
        <SkipForward size={32} />
      </Button>
    </div>
  );
};
