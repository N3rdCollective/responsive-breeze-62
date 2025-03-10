
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface ListenButtonProps {
  isScrolled: boolean;
  isHomePage: boolean;
}

const ListenButton = ({ isScrolled, isHomePage }: ListenButtonProps) => {
  const { togglePlayPause, isPlaying } = useAudioPlayer();
  
  return (
    <Button 
      variant="default" 
      size="sm"
      onClick={togglePlayPause}
      className={`
        ${isScrolled || !isHomePage
          ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90" 
          : "bg-white text-black hover:bg-white/90"
        }
        dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90
      `}
    >
      {isPlaying ? "Pause" : "Listen Live"}
    </Button>
  );
};

export default ListenButton;
