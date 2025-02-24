
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Radio Station
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-primary font-medium' : 'text-gray-600'} hover:text-gray-900`}
            >
              Home
            </Link>
            <Link 
              to="/personalities" 
              className={`${isActive('/personalities') ? 'text-primary font-medium' : 'text-gray-600'} hover:text-gray-900`}
            >
              Personalities
            </Link>
            <Link 
              to="/about" 
              className={`${isActive('/about') ? 'text-primary font-medium' : 'text-gray-600'} hover:text-gray-900`}
            >
              About
            </Link>
            <Link 
              to="/news" 
              className={`${isActive('/news') ? 'text-primary font-medium' : 'text-gray-600'} hover:text-gray-900`}
            >
              News
            </Link>
            <Button variant="default" size="sm">
              Listen Live
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
