
import React from 'react';
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { VideoData } from "@/components/staff/home/context/HomeSettingsContext";
import { useHeroData } from '@/hooks/useHeroData';
import HeroBackground from './hero/HeroBackground';
import HeroContent from './hero/HeroContent';

interface HeroProps {
  videoBackgrounds?: VideoData[];
  title: string;
  subtitle: string;
  ctaText: string;
}

const Hero = ({ 
  videoBackgrounds, // Optional, useHeroData will fetch if not provided
  title,
  subtitle,
  ctaText 
}: HeroProps) => {
  const { greeting, videos, currentVideoIndex, isLoading } = useHeroData(videoBackgrounds);
  const { togglePlayPause, isPlaying } = useAudioPlayer();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <HeroBackground 
        videos={videos} 
        currentVideoIndex={currentVideoIndex} 
        isLoading={isLoading} 
      />
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-10" />
      
      <HeroContent
        greeting={greeting}
        title={title}
        subtitle={subtitle}
        ctaText={ctaText}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
      />
    </div>
  );
};

export default Hero;
