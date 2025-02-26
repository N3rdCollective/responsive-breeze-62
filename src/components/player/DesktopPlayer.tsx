
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { StreamMetadata } from "@/types/player";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";

interface DesktopPlayerProps {
  isPlaying: boolean;
  volume: number[];
  isMuted: boolean;
  metadata: StreamMetadata;
  togglePlayPause: () => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
}

export const DesktopPlayer = ({
  isPlaying,
  volume,
  isMuted,
  metadata,
  togglePlayPause,
  handleVolumeChange,
  toggleMute
}: DesktopPlayerProps) => {
  return (
    <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
      {/* Left Section - Album Art and Track Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="h-14 w-14 rounded-md overflow-hidden flex-shrink-0">
          <AspectRatio ratio={1/1}>
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
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm truncate hover:underline cursor-pointer">
            {metadata.title}
          </h4>
          {metadata.artist && (
            <p className="text-xs text-muted-foreground truncate hover:underline cursor-pointer">
              {metadata.artist}
            </p>
          )}
        </div>
      </div>

      {/* Center Section - Play Controls */}
      <div className="flex-1 flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-14 w-14 rounded-full hover:bg-accent"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
      </div>

      {/* Right Section - Volume Controls */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={toggleMute}
        >
          {volume[0] === 0 || isMuted ? (
            <VolumeX size={20} />
          ) : volume[0] < 50 ? (
            <Volume1 size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </Button>
        <div className="w-32">
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
