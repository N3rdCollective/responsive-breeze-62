
import { Button } from "@/components/ui/button";
import { ChevronDown, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";

interface MinimizeButtonsProps {
  handleMinimize: () => void;
  theme?: string;
}

export const MinimizeButtons = ({ handleMinimize, theme }: MinimizeButtonsProps) => {
  return (
    <>
      {/* Top center floating button */}
      <div className="fixed top-6 left-0 right-0 flex justify-center z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMinimize}
          className="rounded-full px-6 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white shadow-lg flex items-center gap-2"
          aria-label="Minimize player"
        >
          <ChevronDown size={20} />
          <span>Minimize</span>
        </Button>
      </div>

      {/* Corner minimize button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMinimize}
          className={`${
            theme === 'dark' 
              ? 'text-white/60 hover:text-white' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Minimize player"
        >
          <Minimize2 size={24} />
        </Button>
      </div>
    </>
  );
};
