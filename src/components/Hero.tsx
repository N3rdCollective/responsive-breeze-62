
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

type GreetingData = {
  [key: string]: {
    morning: string;
    afternoon: string;
    evening: string;
    slang: string[];
  }
};

type VideoBackground = {
  id: string;
  title: string;
  credit?: string;
}

const videoBackgrounds: VideoBackground[] = [
  { id: "uaGvGnOiY04", title: "Aerial city view at night" },
  { id: "j4Vg274kOvc", title: "Busy city street scene" },
  { id: "PNIBFEJ6UYc", title: "Urban night life" },
  { id: "5CqqZRXO7aM", title: "Downtown buildings" },
  { id: "x06cnZm-Ic4", title: "City skyline" },
];

const greetings: GreetingData = {
  "US-CA": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Hella", "That's fire", "No cap", "Bet", "It's lit", "Facts"],
  },
  "US-NY": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Yerrr", "No cap", "On God", "Facts", "Mad", "Deadass"],
  },
  "US-TX": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Fixin' to", "Y'all", "Bless your heart", "All hat, no cattle"],
  },
  "default": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Hello", "Hi", "Welcome"],
  }
};

const Hero = () => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");
  const { togglePlayPause, isPlaying } = useAudioPlayer();
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.region_code && data.country_code) {
          setLocation(`${data.country_code}-${data.region_code}`);
        }
      } catch (error) {
        console.log('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    // Rotate videos every 45 seconds
    const videoRotationInterval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => 
        (prevIndex + 1) % videoBackgrounds.length
      );
    }, 45000);

    return () => clearInterval(videoRotationInterval);
  }, []);

  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      const locationData = greetings[location] || greetings.default;
      const slang = locationData.slang[Math.floor(Math.random() * locationData.slang.length)];
      
      let timeGreeting;
      if (hour < 12) timeGreeting = locationData.morning;
      else if (hour < 17) timeGreeting = locationData.afternoon;
      else timeGreeting = locationData.evening;
      
      return `${slang}! ${timeGreeting}`;
    };

    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [location]);

  const currentVideo = videoBackgrounds[currentVideoIndex];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* YouTube iframe for background video */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&playlist=${currentVideo.id}&disablekb=1&modestbranding=1&start=15`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute w-[300%] h-[300%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            title={currentVideo.title}
          />
        </div>
      </div>
      
      {/* Fallback image in case video doesn't load */}
      <img 
        src="/lovable-uploads/2d39862c-be68-49df-afe5-b212fd22bfbe.png"
        alt="City skyline fallback image"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-0"
        style={{ opacity: 0 }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-20">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-[#666666]/30 dark:bg-[#666666]/40 text-sm font-medium tracking-wide animate-fadeIn text-white">
          {greeting}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fadeIn [animation-delay:200ms] text-white">
          Experience the Power of Sound
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fadeIn [animation-delay:400ms]">
          Join us on a journey through music, stories, and connections that move you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn [animation-delay:600ms]">
          <Button
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90 px-8 py-6 text-lg"
            onClick={togglePlayPause}
          >
            {isPlaying ? "Pause" : "Listen Live"}
          </Button>
          <Link to="/schedule">
            <Button
              variant="outline"
              className="border-2 border-[#FFD700] text-[#FFD700] bg-black/40 hover:bg-black/60 px-8 py-6 text-lg dark:border-[#FFD700] dark:text-white dark:hover:bg-[#FFD700]/10"
            >
              View Schedule
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
