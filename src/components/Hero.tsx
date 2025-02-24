
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485827404703-89b55fcc595e')] bg-cover bg-center opacity-5" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-black/5 text-sm font-medium tracking-wide animate-fadeIn">
          Welcome to Our Radio Station
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fadeIn [animation-delay:200ms]">
          Experience the Power of Sound
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fadeIn [animation-delay:400ms]">
          Join us on a journey through music, stories, and connections that move you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeIn [animation-delay:600ms]">
          <Button
            className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg"
          >
            Listen Live
          </Button>
          <Button
            variant="outline"
            className="border-2 px-8 py-6 text-lg"
          >
            View Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
