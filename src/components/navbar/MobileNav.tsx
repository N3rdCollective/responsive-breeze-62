import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";

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
}

const MobileNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted,
  isUserLoggedIn
}: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = (path: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo(0, 0);
    }
    setIsOpen(false);
  };
  
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
            {navigationItems.map((item) => (
              item.path === "#" && item.onClick ? (
                <button
                  key={item.path + item.label}
                  onClick={() => {
                    item.onClick && item.onClick();
                    setIsOpen(false);
                  }}
                  className={`
                    ${isActive(item.path)
                      ? 'text-primary dark:text-primary'
                      : 'text-foreground hover:text-primary dark:hover:text-primary'
                    }
                    text-lg font-medium transition-colors duration-200 text-left
                  `}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => handleNavigation(item.path, item.onClick)}
                  className={`
                    ${isActive(item.path)
                      ? 'text-primary dark:text-primary'
                      : 'text-foreground hover:text-primary dark:hover:text-primary'
                    }
                    text-lg font-medium transition-colors duration-200
                  `}
                >
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
