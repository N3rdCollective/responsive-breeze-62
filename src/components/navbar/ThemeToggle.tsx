
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  isHomePage: boolean;
  isScrolled: boolean;
  mobile?: boolean;
}

const ThemeToggle = ({ isHomePage, isScrolled, mobile = false }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  if (mobile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="justify-start px-0 hover:bg-transparent"
      >
        {theme === "light" ? (
          <div className="flex items-center text-[#333333] hover:text-[#FFD700]">
            <Moon className="h-5 w-5 mr-2" />
            <span>Dark Mode</span>
          </div>
        ) : (
          <div className="flex items-center text-white hover:text-[#FFD700]">
            <Sun className="h-5 w-5 mr-2" />
            <span>Light Mode</span>
          </div>
        )}
      </Button>
    );
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`
        ${isHomePage && !isScrolled
          ? "text-white hover:text-[#FFD700]"
          : "text-[#333333] hover:text-[#FFD700]"
        }
        dark:text-white dark:hover:text-[#FFD700]
      `}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
