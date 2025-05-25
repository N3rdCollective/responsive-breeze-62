
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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-20 text-white">
      {greeting && (
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium tracking-wide animate-fadeIn">
          {greeting}
        </span>
      )}
      <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fadeIn [animation-delay:200ms]">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fadeIn [animation-delay:400ms]">
        {subtitle}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn [animation-delay:600ms]">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
          onClick={togglePlayPause}
        >
          {isPlaying ? "Pause Stream" : ctaText}
        </Button>
        <Link to="/schedule">
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
          >
            View Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeroContent;
