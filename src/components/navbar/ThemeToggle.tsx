
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  isHomePage: boolean;
  isScrolled: boolean;
  mobile?: boolean;
  dropdown?: boolean;
}

const ThemeToggle = ({ isHomePage, isScrolled, mobile = false, dropdown = false }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Dropdown variant for user menu
  if (dropdown) {
    return (
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {theme === "light" ? (
          <>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </>
        )}
      </button>
    );
  }
  
  if (mobile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="justify-start px-0 hover:bg-transparent"
      >
        {theme === "light" ? (
          <div className="flex items-center text-foreground">
            <Moon className="h-5 w-5 mr-2" />
            <span>Dark Mode</span>
          </div>
        ) : (
          <div className="flex items-center text-foreground">
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
      className="text-foreground"
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
