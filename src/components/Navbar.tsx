
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme toggle after mounting to avoid hydration mismatch
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
      isScrolled ? "bg-white/90 dark:bg-[#333333]/90 backdrop-blur-md shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-[#FFD700]">
              Radio Station
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-gray-900 dark:text-[#FFD700] font-medium' : 'text-gray-600 dark:text-white'} hover:text-gray-900 dark:hover:text-[#FFD700]`}
            >
              Home
            </Link>
            <Link 
              to="/personalities" 
              className={`${isActive('/personalities') ? 'text-gray-900 dark:text-[#FFD700] font-medium' : 'text-gray-600 dark:text-white'} hover:text-gray-900 dark:hover:text-[#FFD700]`}
            >
              Personalities
            </Link>
            <Link 
              to="/schedule" 
              className={`${isActive('/schedule') ? 'text-gray-900 dark:text-[#FFD700] font-medium' : 'text-gray-600 dark:text-white'} hover:text-gray-900 dark:hover:text-[#FFD700]`}
            >
              Schedule
            </Link>
            <Link 
              to="/about" 
              className={`${isActive('/about') ? 'text-gray-900 dark:text-[#FFD700] font-medium' : 'text-gray-600 dark:text-white'} hover:text-gray-900 dark:hover:text-[#FFD700]`}
            >
              About
            </Link>
            <Link 
              to="/news" 
              className={`${isActive('/news') ? 'text-gray-900 dark:text-[#FFD700] font-medium' : 'text-gray-600 dark:text-white'} hover:text-gray-900 dark:hover:text-[#FFD700]`}
            >
              News
            </Link>
            <Link 
              to="/contact" 
              className={`${isActive('/contact') ? 'text-gray-900 dark:text-[#FFD700] font-medium' : 'text-gray-600 dark:text-white'} hover:text-gray-900 dark:hover:text-[#FFD700]`}
            >
              Contact
            </Link>
            <Button 
              variant="default" 
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 dark:bg-[#FFD700] dark:text-black dark:hover:bg-[#FFD700]/90"
            >
              Listen Live
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-[#FFD700]"
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
