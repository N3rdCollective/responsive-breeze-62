
import React from 'react';
import { VideoData } from '@/components/staff/home/context/HomeSettingsContext';

interface HeroBackgroundProps {
  videos: VideoData[];
  currentVideoIndex: number;
  isLoading: boolean;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({ videos, currentVideoIndex, isLoading }) => {
  if (isLoading || videos.length === 0) {
    return (
      <>
        {/* Fallback static background image */}
        <img 
          src="/lovable-uploads/2d39862c-be68-49df-afe5-b212fd22bfbe.png"
          alt="City skyline fallback"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </>
    );
  }

  const currentVideo = videos[currentVideoIndex % videos.length];

  return (
    <>
      {/* YouTube Iframe Background */}
      {currentVideo && (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&playlist=${currentVideo.youtube_id}&disablekb=1&modestbranding=1&start=15`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute w-[300%] h-[300%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              title={currentVideo.title || 'Background Video'}
            />
          </div>
        </div>
      )}
      {/* Fallback image (hidden by default, but good for structure or if iframe fails catastrophically) */}
      <img 
        src="/lovable-uploads/2d39862c-be68-49df-afe5-b212fd22bfbe.png"
        alt="Fallback background"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-0" // Hidden
      />
    </>
  );
};

export default HeroBackground;
