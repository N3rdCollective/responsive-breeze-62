
import { Button } from "@/components/ui/button";
import { Star, MoreHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState, useEffect } from "react";

interface TrackInfoProps {
  title: string;
  artist?: string;
  theme?: string;
}

export const TrackInfo = ({ title, artist, theme }: TrackInfoProps) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      setShouldScroll(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [title]);

  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1 flex-1 min-w-0">
        <div className="relative overflow-hidden">
          <h2 
            ref={titleRef}
            className={`text-2xl font-semibold whitespace-nowrap ${
              shouldScroll ? 'animate-marquee' : 'truncate'
            }`}
          >
            {title}
          </h2>
        </div>
        {artist && (
          <p className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-muted-foreground'} truncate`}>
            {artist}
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className={theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'}
        >
          <Star size={24} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'}
        >
          <MoreHorizontal size={24} />
        </Button>
      </div>
    </div>
  );
};
