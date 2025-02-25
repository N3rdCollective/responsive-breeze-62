
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
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

const STREAM_URL = "https://streaming.live365.com/a73297";
const METADATA_URL = "https://api.live365.com/station/a73297"; // Metadata endpoint

interface StreamMetadata {
  title: string;
  artist?: string;
}

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState([50]);
  const [metadata, setMetadata] = useState<StreamMetadata>({ title: "Rappin' Lounge Radio" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataIntervalRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume[0] / 100;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(METADATA_URL);
        if (response.ok) {
          const data = await response.json();
          // Update depending on the actual API response structure
          if (data.now_playing) {
            setMetadata({
              title: data.now_playing.title || "Rappin' Lounge Radio",
              artist: data.now_playing.artist
            });
            console.log("New metadata:", data.now_playing);
          }
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    // Initial fetch
    fetchMetadata();

    // Set up polling interval (every 30 seconds)
    metadataIntervalRef.current = window.setInterval(fetchMetadata, 30000);

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        toast({
          description: "Stream paused",
        });
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Playback failed:", error);
          toast({
            variant: "destructive",
            description: "Failed to start playback. Please try again.",
          });
        });
        toast({
          description: `Now streaming: ${metadata.title}`,
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    setPreviousVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    if (newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume[0] / 100;
        setVolume(previousVolume);
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
        setVolume([0]);
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Currently Playing */}
          <div className="flex items-center space-x-4 w-1/4">
            <div className="w-12 h-12 bg-muted rounded">
              {/* Album art would go here */}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-sm font-medium text-primary truncate">{metadata.title}</h4>
              <p className="text-xs text-muted-foreground">
                {metadata.artist || "Live Stream"}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center w-2/4">
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
                className="rounded-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-black"
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
              <span className="text-xs text-muted-foreground w-10 text-right">LIVE</span>
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="w-full"
                disabled
              />
              <span className="text-xs text-muted-foreground w-10">24/7</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 w-1/4 justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary hidden sm:inline-flex"
              onClick={toggleMute}
            >
              {volume[0] === 0 || isMuted ? <VolumeX size={20} /> : 
               volume[0] < 50 ? <Volume1 size={20} /> : <Volume2 size={20} />}
            </Button>
            <div className="w-24 hidden sm:block">
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
      </div>
    </div>
  );
};

export default MusicPlayer;
