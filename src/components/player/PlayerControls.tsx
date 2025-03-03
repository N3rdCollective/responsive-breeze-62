
import { useState } from "react";
import { PlayButtons } from "./controls/PlayButtons";
import { ProgressSlider } from "./controls/ProgressSlider";

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
      <PlayButtons
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        isFullscreen={isFullscreen}
      />
      <ProgressSlider
        showVolumeSlider={showVolumeSlider}
        volume={volume}
        onVolumeChange={onVolumeChange}
        progress={progress}
      />
    </div>
  );
};
