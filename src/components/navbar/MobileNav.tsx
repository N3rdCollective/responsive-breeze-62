
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Shield, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NavItem from "./NavItem"; // Import NavItem
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileNavigationItem { // Renamed to avoid conflict if NavigationItem from types/profile is imported
  path: string;
  label: string;
  onClick?: () => void;
  icon?: React.ElementType; 
  iconOnly?: boolean;
  badgeCount?: number;
}

interface MobileNavProps {
  navigationItems: MobileNavigationItem[];
  isActive: (path: string) => boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  mounted: boolean;
  isUserLoggedIn: boolean;
  staffName?: string | null;
}

const MobileNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted,
  isUserLoggedIn,
  staffName
}: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = (isLink: boolean, path?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    if (isLink && path) {
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

  // Extract the Messages NavItem if it's iconOnly
  const messagesNavItem = navigationItems.find(item => item.path === "/messages" && item.iconOnly === true);
  // Filter out the Messages NavItem from the list used in the SheetContent
  const sheetNavigationItems = navigationItems.filter(item => !(item.path === "/messages" && item.iconOnly === true));

  return (
    <div className="md:hidden flex items-center space-x-2">
      <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
      {isUserLoggedIn && messagesNavItem && (
         <NavItem
            key={messagesNavItem.path + messagesNavItem.label}
            path={messagesNavItem.path}
            label={messagesNavItem.label}
            isActive={isActive(messagesNavItem.path)}
            isHomePage={isHomePage}
            isScrolled={isScrolled}
            onClick={messagesNavItem.onClick}
            icon={messagesNavItem.icon}
            iconOnly={messagesNavItem.iconOnly}
            badgeCount={messagesNavItem.badgeCount}
            className="p-2" // Style as an icon button for the top bar
          />
      )}
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
            {sheetNavigationItems.map((item) => { // Use the filtered list here
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
