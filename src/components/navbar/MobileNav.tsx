
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Shield, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileNavigationItem {
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
      ? 'text-primary dark:text-primary bg-primary/10'
      : 'text-foreground hover:text-primary dark:hover:text-primary hover:bg-muted/50'
    }
    text-base font-medium transition-colors duration-200 flex items-center gap-3 relative p-4 rounded-lg min-h-[52px] touch-manipulation
  `;

  const buttonClasses = `
    text-foreground hover:text-primary dark:hover:text-primary hover:bg-muted/50
    text-base font-medium transition-colors duration-200 text-left w-full flex items-center gap-3 relative p-4 rounded-lg min-h-[52px] touch-manipulation
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
            className="p-2 min-h-[44px] min-w-[44px]"
          />
      )}
      {isUserLoggedIn && <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} mobile />}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`
              min-h-[44px] min-w-[44px] touch-manipulation
              ${isHomePage && !isScrolled
                ? "text-white hover:text-primary dark:text-primary dark:hover:text-white"
                : "text-foreground hover:text-primary dark:hover:text-primary"
              }
            `}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-[85vw] max-w-[350px] bg-background text-foreground p-0 flex flex-col"
        >
          <SheetHeader className="p-4 sm:p-6 border-b">
            <SheetTitle className="text-left text-xl font-bold text-primary dark:text-primary">
              Menu
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex flex-col space-y-2">
              {staffName && (
                <Link
                  to="/staff/panel"
                  onClick={() => handleNavigation(true, "/staff/panel")}
                  className={linkClasses("/staff/panel")}
                >
                  <Shield className="h-5 w-5 flex-shrink-0" /> 
                  <span>Staff Panel</span>
                </Link>
              )}
              {sheetNavigationItems.map((item) => {
                const ItemIcon = item.icon as LucideIcon | undefined;
                const accessibilityProps = item.iconOnly && item.label ? { 'aria-label': item.label, title: item.label } : {};
                
                const content = (
                  <>
                    {ItemIcon && <ItemIcon className="h-5 w-5 flex-shrink-0" />}
                    {item.iconOnly ? null : <span className="flex-1 truncate">{item.label}</span>}
                    {item.badgeCount && item.badgeCount > 0 && (
                      <Badge
                        variant="destructive"
                        className={cn(
                          "h-5 min-w-[1.25rem] p-0.5 flex items-center justify-center text-xs rounded-full flex-shrink-0",
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
            </div>
          </div>
          
          {mounted && (
            <div className="p-4 sm:p-6 border-t mt-auto">
              <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} mobile />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
