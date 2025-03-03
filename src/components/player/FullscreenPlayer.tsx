
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { StreamMetadata } from "@/types/player";
import { VolumeControl } from "./VolumeControl";
import { MinimizeButtons } from "./fullscreen/MinimizeButtons";
import { AlbumArt } from "./fullscreen/AlbumArt";
import { TrackInfo } from "./fullscreen/TrackInfo";
import { TimelineSlider } from "./fullscreen/TimelineSlider";
import { PlaybackControls } from "./fullscreen/PlaybackControls";

interface FullscreenPlayerProps {
  isPlaying: boolean;
  volume: number[];
  isMuted: boolean;
  metadata: StreamMetadata;
  togglePlayPause: () => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const FullscreenPlayer = ({
  isPlaying,
  volume,
  isMuted,
  metadata,
  togglePlayPause,
  handleVolumeChange,
  toggleMute,
  toggleFullscreen,
  isFullscreen
}: FullscreenPlayerProps) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const handleMinimize = () => {
    console.log("Minimizing player from FullscreenPlayer");
    toggleFullscreen();
  };
  
  return (
    <div className={`h-full flex flex-col justify-between py-8 px-6 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-[#1A1F2C] to-[#121520] text-white'
        : 'bg-gradient-to-b from-[#F1F0FB] to-[#E6E4F0] text-foreground'
    }`}>
      {/* Minimize buttons */}
      <MinimizeButtons handleMinimize={handleMinimize} theme={theme} />

      {/* Album artwork */}
      <AlbumArt artwork={metadata.artwork || ""} />

      <div className="space-y-6">
        {/* Track information */}
        <TrackInfo 
          title={metadata.title} 
          artist={metadata.artist} 
          theme={theme} 
        />

        {/* Timeline/progress slider */}
        <TimelineSlider theme={theme} />

        {/* Playback controls */}
        <PlaybackControls 
          isPlaying={isPlaying} 
          togglePlayPause={togglePlayPause} 
          theme={theme} 
        />

        {/* Volume controls for mobile */}
        {isMobile && (
          <div className="pt-2">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />
          </div>
        )}
      </div>
    </div>
  );
};
