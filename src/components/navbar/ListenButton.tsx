
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
          variant={isScrolled || !isHomePage ? "default" : "secondary"}
          size="sm"
          className={
            isHomePage && !isScrolled
              ? "bg-white text-black hover:bg-white/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              : ""
          }
        >
          <Music className="mr-2 h-4 w-4" />
          Request a Song
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background to-muted border-border p-0">
        <div className="p-6 space-y-4">
          <DialogHeader className="pb-3 text-left">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Music className="h-5 w-5" />
              Request a Track - {RADIO_CO_CONFIG.stationName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden border border-border">
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
