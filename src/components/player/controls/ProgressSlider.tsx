
import { Slider } from "@/components/ui/slider";

interface ProgressSliderProps {
  showVolumeSlider: boolean;
  volume?: number[];
  onVolumeChange?: (value: number[]) => void;
  progress: number[];
}

export const ProgressSlider = ({ 
  showVolumeSlider, 
  volume, 
  onVolumeChange,
  progress
}: ProgressSliderProps) => {
  return (
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
  );
};
