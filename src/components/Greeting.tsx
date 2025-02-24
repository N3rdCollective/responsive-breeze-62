
import { useState, useEffect } from 'react';

type GreetingData = {
  [key: string]: {
    morning: string;
    afternoon: string;
    evening: string;
    slang: string[];
  }
};

const greetings: GreetingData = {
  "US-CA": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Hey dude", "What's up", "Howdy", "Yo"]
  },
  "US-NY": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Yo", "Hey", "What's good", "How you doin'"]
  },
  "US-TX": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Howdy", "Hey y'all", "What's up y'all"]
  },
  "default": {
    morning: "Good Morning",
    afternoon: "Good Afternoon",
    evening: "Good Evening",
    slang: ["Hello", "Hi", "Welcome"]
  }
};

const Greeting = () => {
  const [location, setLocation] = useState<string>("default");
  const [greeting, setGreeting] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Loading greeting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{greeting}</h2>
          <p className="text-lg text-gray-600">Thanks for tuning in to your favorite radio station!</p>
        </div>
      </div>
    </div>
  );
};

export default Greeting;
