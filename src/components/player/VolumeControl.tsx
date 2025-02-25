
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Volume1, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number[];
  isMuted: boolean;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
}

export const VolumeControl = ({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onToggleMute 
}: VolumeControlProps) => {
  return (
    <div className="flex items-center space-x-2 w-1/4 justify-end">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-muted-foreground hover:text-primary hidden sm:inline-flex"
        onClick={onToggleMute}
      >
        {volume[0] === 0 || isMuted ? <VolumeX size={20} /> : 
         volume[0] < 50 ? <Volume1 size={20} /> : <Volume2 size={20} />}
      </Button>
      <div className="w-24 hidden sm:block">
        <Slider
          value={volume}
          onValueChange={onVolumeChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};
