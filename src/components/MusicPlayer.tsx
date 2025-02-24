
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Shuffle
} from "lucide-react";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
  };

  const handleProgressChange = (newProgress: number[]) => {
    setProgress(newProgress);
  };

  const VolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX size={20} />;
    if (volume[0] < 50) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Currently Playing */}
          <div className="flex items-center space-x-4 w-1/4">
            <div className="w-12 h-12 bg-gray-200 rounded">
              {/* Album art would go here */}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-sm font-medium">Currently Playing</h4>
              <p className="text-xs text-gray-500">Artist Name</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center w-2/4">
            <div className="flex items-center space-x-4 mb-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-black"
              >
                <Shuffle size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-black"
              >
                <SkipBack size={20} />
              </Button>
              <Button 
                variant="default" 
                size="icon" 
                className="rounded-full bg-black hover:bg-gray-800 text-white"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-black"
              >
                <SkipForward size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-black"
              >
                <Repeat size={20} />
              </Button>
            </div>
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-gray-500 w-10 text-right">0:00</span>
              <Slider
                value={progress}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-gray-500 w-10">3:45</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 w-1/4 justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-black hidden sm:inline-flex"
            >
              <VolumeIcon />
            </Button>
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24 hidden sm:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
