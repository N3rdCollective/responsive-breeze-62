
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";

export const TimelineSlider = ({ theme }: { theme?: string }) => {
  return (
    <div className="space-y-2">
      <Slider
        value={[0]}
        max={100}
        step={1}
        className="w-full"
        disabled
      />
      <div className={`flex justify-between text-sm ${
        theme === 'dark' ? 'text-white/40' : 'text-muted-foreground'
      }`}>
        <span>LIVE</span>
        <span>24/7</span>
      </div>
    </div>
  );
};
