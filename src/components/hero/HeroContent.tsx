
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroContentProps {
  greeting: string;
  title: string;
  subtitle: string;
  ctaText: string;
  isPlaying: boolean;
  togglePlayPause: () => void;
}

const HeroContent: React.FC<HeroContentProps> = ({ 
  greeting, 
  title, 
  subtitle, 
  ctaText, 
  isPlaying, 
  togglePlayPause 
}) => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center z-20 text-white">
      {greeting && (
        <span className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs sm:text-sm font-medium tracking-wide animate-fadeIn">
          {greeting}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight animate-fadeIn [animation-delay:200ms] leading-tight">
        {title}
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto animate-fadeIn [animation-delay:400ms] leading-relaxed px-4 sm:px-0">
        {subtitle}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fadeIn [animation-delay:600ms] px-4 sm:px-0">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto min-h-[44px] touch-manipulation"
          onClick={togglePlayPause}
        >
          {isPlaying ? "Pause Stream" : ctaText}
        </Button>
        <Link to="/schedule" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto min-h-[44px] touch-manipulation"
          >
            View Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeroContent;
