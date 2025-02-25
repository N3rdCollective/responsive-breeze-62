
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { togglePlayPause, isPlaying } = useAudioPlayer();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/90 dark:bg-[#333333]/90 backdrop-blur-md shadow-sm" 
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold ${
              isScrolled 
                ? "text-gray-900 dark:text-[#FFD700]" 
                : "text-white dark:text-[#FFD700]"
            }`}>
              Rappin' Lounge
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {[
              { path: "/", label: "Home" },
              { path: "/personalities", label: "Personalities" },
              { path: "/schedule", label: "Schedule" },
              { path: "/about", label: "About" },
              { path: "/news", label: "News" },
              { path: "/contact", label: "Contact" },
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`
                  ${isActive(item.path) 
                    ? 'text-[#FFD700] dark:text-[#FFD700]' 
                    : isScrolled 
                      ? 'text-gray-600 dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]'
                      : 'text-white dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]'
                  }
                  transition-colors duration-200
                `}
              >
                {item.label}
              </Link>
            ))}
            <Button 
              variant="default" 
              size="sm"
              onClick={togglePlayPause}
              className={`
                ${isScrolled 
                  ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90" 
                  : "bg-gray-900 text-white hover:bg-gray-800"}
                dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90
              `}
            >
              {isPlaying ? "Pause" : "Listen Live"}
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={`
                  ${isScrolled 
                    ? "text-gray-600 hover:text-gray-900" 
                    : "text-white hover:text-[#FFD700]"}
                  dark:text-white dark:hover:text-[#FFD700]
                `}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
