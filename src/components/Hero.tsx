
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

type GreetingData = {
  [key: string]: {
    morning: string;
    afternoon: string;
    evening: string;
    slang: string[];
    skyline?: string;
  }
};

const greetings: GreetingData = {
  "US-CA": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Hella", "That's fire", "No cap", "Bet", "It's lit", "Facts"],
    skyline: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070" // Los Angeles skyline
  },
  "US-NY": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Yerrr", "No cap", "On God", "Facts", "Mad", "Deadass"],
    skyline: "https://images.unsplash.com/photo-1582785513054-82f50669f74d?q=80&w=2071" // NYC skyline
  },
  "US-TX": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Fixin' to", "Y'all", "Bless your heart", "All hat, no cattle"],
    skyline: "https://images.unsplash.com/photo-1545194445-dddb59838230?q=80&w=2070" // Dallas skyline
  },
  "default": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Hello", "Hi", "Welcome"],
    skyline: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070" // Default skyline
  }
};

const Hero = () => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");

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

  const getSkylineImage = () => {
    const locationData = greetings[location] || greetings.default;
    return locationData.skyline;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('${getSkylineImage()}')`,
          opacity: 0.3
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-white/90 dark:from-gray-900/90 dark:to-gray-800/90" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-black/5 dark:bg-white/5 text-sm font-medium tracking-wide animate-fadeIn">
          {greeting}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fadeIn [animation-delay:200ms] text-gray-900 dark:text-white">
          Experience the Power of Sound
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-fadeIn [animation-delay:400ms]">
          Join us on a journey through music, stories, and connections that move you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn [animation-delay:600ms]">
          <Button
            className="bg-black dark:bg-white dark:text-black text-white hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-6 text-lg"
          >
            Listen Live
          </Button>
          <Button
            variant="outline"
            className="border-2 px-8 py-6 text-lg dark:border-white dark:text-white"
          >
            View Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
