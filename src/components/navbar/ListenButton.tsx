
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useEffect } from "react";

interface ListenButtonProps {
  isScrolled: boolean;
  isHomePage: boolean;
}

const ListenButton = ({ isScrolled, isHomePage }: ListenButtonProps) => {
  const { togglePlayPause, isPlaying } = useAudioPlayer();
  
  useEffect(() => {
    console.log("ListenButton - Current playing state:", isPlaying);
  }, [isPlaying]);
  
  const handleClick = () => {
    console.log("Listen button clicked, current playing state:", isPlaying);
    togglePlayPause();
    
    // Make sure player is visible by scrolling to it if needed
    const player = document.getElementById('desktop-music-player') || 
                  document.getElementById('music-player-container');
    
    if (player) {
      console.log("Found player element, ensuring visibility");
      player.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      console.error("No player element found in the DOM");
    }
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
