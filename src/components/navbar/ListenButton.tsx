
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface ListenButtonProps {
  isScrolled: boolean;
  isHomePage: boolean;
}

const ListenButton = ({ isScrolled, isHomePage }: ListenButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const RADIO_CO_CONFIG = {
    widgetId: 'w34954fe',
    stationName: 'Rappin Lounge Radio',
    embedUrl: 'https://embed.radio.co/request/w34954fe.html'
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm"
          className={`
            ${isScrolled || !isHomePage
              ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90" 
              : "bg-white text-black hover:bg-white/90"
            }
            dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90
          `}
        >
          <Music className="mr-2 h-4 w-4" />
          Request a Song
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 p-0">
        <div className="p-6 space-y-4">
          <DialogHeader className="pb-3 text-left">
            <DialogTitle className="flex items-center gap-2 text-yellow-400">
              <Music className="h-5 w-5" />
              Request a Track - {RADIO_CO_CONFIG.stationName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-yellow-500/20">
            <iframe 
              src={RADIO_CO_CONFIG.embedUrl}
              width="100%" 
              height="350"
              style={{ border: 'none', background: 'transparent' }}
              title="Radio.co Request Widget"
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListenButton;
