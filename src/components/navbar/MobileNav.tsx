import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Shield, type LucideIcon } from "lucide-react"; // Import Shield icon
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// NavItem is not used here for rendering items, direct Links are used.
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { cn } from "@/lib/utils"; // Import cn

// This local NavigationItem type is fine as it's only used for the props
interface NavigationItem {
  path: string;
  label: string;
  onClick?: () => void;
  icon?: React.ElementType; 
  iconOnly?: boolean;
  badgeCount?: number; // Add badgeCount here
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
    text-lg font-medium transition-colors duration-200 flex items-center gap-2 relative
  `;

  const buttonClasses = `
    text-foreground hover:text-primary dark:hover:text-primary
    text-lg font-medium transition-colors duration-200 text-left w-full flex items-center gap-2 relative
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
            {navigationItems.map((item) => {
              const ItemIcon = item.icon as LucideIcon | undefined;
              const accessibilityProps = item.iconOnly && item.label ? { 'aria-label': item.label, title: item.label } : {};
              
              const content = (
                <>
                  {ItemIcon && <ItemIcon className="h-5 w-5" />}
                  {item.iconOnly ? null : <span className="flex-1">{item.label}</span>}
                  {item.badgeCount && item.badgeCount > 0 && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "h-5 min-w-[1.25rem] p-0.5 flex items-center justify-center text-xs rounded-full",
                         item.iconOnly ? "absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2" : "ml-auto" 
                      )}
                       style={{ lineHeight: '1' }}
                    >
                      {item.badgeCount > 9 ? '9+' : item.badgeCount}
                    </Badge>
                  )}
                </>
              );

              return item.onClick && item.path.startsWith("#") ? ( 
                <button
                  key={item.path + item.label}
                  onClick={() => handleNavigation(false, undefined, item.onClick)}
                  className={buttonClasses}
                  {...accessibilityProps}
                >
                  {content}
                </button>
              ) : (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => handleNavigation(true, item.path, item.onClick)}
                  className={linkClasses(item.path)}
                  {...accessibilityProps}
                >
                  {content}
                </Link>
              )
            })}
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
