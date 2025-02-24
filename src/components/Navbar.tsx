
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
      isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Radio Station
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-gray-900 dark:hover:text-white`}
            >
              Home
            </Link>
            <Link 
              to="/personalities" 
              className={`${isActive('/personalities') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-gray-900 dark:hover:text-white`}
            >
              Personalities
            </Link>
            <Link 
              to="/schedule" 
              className={`${isActive('/schedule') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-gray-900 dark:hover:text-white`}
            >
              Schedule
            </Link>
            <Link 
              to="/about" 
              className={`${isActive('/about') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-gray-900 dark:hover:text-white`}
            >
              About
            </Link>
            <Link 
              to="/news" 
              className={`${isActive('/news') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-gray-900 dark:hover:text-white`}
            >
              News
            </Link>
            <Link 
              to="/contact" 
              className={`${isActive('/contact') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'} hover:text-gray-900 dark:hover:text-white`}
            >
              Contact
            </Link>
            <Button variant="default" size="sm">
              Listen Live
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="ml-4"
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
