
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useEffect } from "react";

interface ListenButtonProps {
  isScrolled: boolean;
  isHomePage: boolean;
}

const ListenButton = ({ isScrolled, isHomePage }: ListenButtonProps) => {
  const { togglePlayPause, isPlaying } = useAudioPlayer();
  
  // Log the current playing status when it changes
  useEffect(() => {
    console.log("ListenButton - Current playing state:", isPlaying);
  }, [isPlaying]);
  
  const handleClick = () => {
    console.log("Listen button clicked, current playing state:", isPlaying);
    togglePlayPause();
  };
  
  return (
    <Button 
      variant="default" 
      size="sm"
      onClick={handleClick}
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
