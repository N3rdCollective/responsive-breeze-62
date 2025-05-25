
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Shield } from "lucide-react"; // Import Shield icon
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NavItem from "./NavItem"; // NavItem is not used here for rendering items, direct Links are used.
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";

// This local NavigationItem type is fine as it's only used for the props
interface NavigationItem {
  path: string;
  label: string;
  onClick?: () => void;
}

interface MobileNavProps {
  navigationItems: NavigationItem[];
  isActive: (path: string) => boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  mounted: boolean;
  isUserLoggedIn: boolean;
  staffName?: string | null; // Add staffName prop
}

const MobileNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted,
  isUserLoggedIn,
  staffName // Destructure staffName
}: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = (isLink: boolean, path?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    if (isLink && path) { // only scroll if it's a link navigation
        window.scrollTo(0, 0);
    }
    setIsOpen(false);
  };
  
  const linkClasses = (path: string) => `
    ${isActive(path)
      ? 'text-primary dark:text-primary'
      : 'text-foreground hover:text-primary dark:hover:text-primary'
    }
    text-lg font-medium transition-colors duration-200 flex items-center gap-2
  `;

  const buttonClasses = `
    text-foreground hover:text-primary dark:hover:text-primary
    text-lg font-medium transition-colors duration-200 text-left w-full flex items-center gap-2
  `;

  return (
    <div className="md:hidden flex items-center space-x-2">
      <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
      {isUserLoggedIn && <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} mobile />}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`
              ${isHomePage && !isScrolled
                ? "text-white hover:text-primary dark:text-primary dark:hover:text-white"
                : "text-foreground hover:text-primary dark:hover:text-primary"
              }
            `}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background text-foreground">
          <SheetHeader>
            <SheetTitle className="text-left text-xl font-bold text-primary dark:text-primary">
              Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4 mt-8">
            {staffName && (
              <Link
                to="/staff/panel"
                onClick={() => handleNavigation(true, "/staff/panel")}
                className={linkClasses("/staff/panel")}
              >
                <Shield className="h-5 w-5" /> Staff Panel
              </Link>
            )}
            {navigationItems.map((item) => (
              item.onClick && item.path.startsWith("#") ? ( // Typically logout or special actions
                <button
                  key={item.path + item.label}
                  onClick={() => handleNavigation(false, undefined, item.onClick)}
                  className={buttonClasses}
                >
                  {/* Icon could be added here if NavigationItem type supported it */}
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => handleNavigation(true, item.path, item.onClick)}
                  className={linkClasses(item.path)}
                >
                  {/* Icon could be added here if NavigationItem type supported it */}
                  {item.label}
                </Link>
              )
            ))}
            {mounted && (
              <div className="pt-4 border-t border-border">
                <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} mobile />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;

