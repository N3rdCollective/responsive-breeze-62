
import { Link } from "react-router-dom";
import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import { NavigationItem } from "@/types/profile";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopNavProps {
  navigationItems: NavigationItem[];
  isActive: (path: string) => boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  mounted: boolean;
  isUserLoggedIn: boolean;
  staffName?: string | null;
}

const DesktopNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted,
  isUserLoggedIn,
  staffName
}: DesktopNavProps) => {
  const navItemBaseStyling = (active: boolean) => 
    active
    ? 'text-[#FFD700] dark:text-[#FFD700]'
    : isHomePage && !isScrolled
      ? 'text-white hover:text-[#FFD700]'
      : 'text-[#333333] dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]';
  
  const navItemCommonClasses = 'font-medium transition-colors duration-200 px-3 py-2 flex items-center';

  // Extract the Messages NavItem if it's iconOnly
  const messagesNavItem = navigationItems.find(item => item.path === "/messages" && item.iconOnly === true);
  // Filter out the Messages NavItem from the main list to prevent duplicate rendering
  const otherNavItems = navigationItems.filter(item => !(item.path === "/messages" && item.iconOnly === true));

  return (
    <div className="hidden md:flex items-center space-x-1">
      {otherNavItems.map((item) => (
        <NavItem 
          key={item.path + item.label}
          path={item.path}
          label={item.label}
          isActive={isActive(item.path)}
          isHomePage={isHomePage}
          isScrolled={isScrolled}
          onClick={item.onClick}
          icon={item.icon}
          iconOnly={item.iconOnly}
          badgeCount={item.badgeCount}
          className={item.iconOnly ? "p-2" : "px-3 py-2"}
        />
      ))}
      {staffName && (
        <Link
          to="/staff/panel"
          className={cn(navItemBaseStyling(isActive("/staff/panel")), navItemCommonClasses)}
          onClick={() => window.scrollTo(0,0)}
        >
          <Shield className="h-4 w-4 mr-1.5" />
          Staff Panel
        </Link>
      )}
      <div className="flex items-center space-x-1 ml-4">
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
            className={messagesNavItem.iconOnly ? "p-2" : "px-3 py-2"} // Consistent className application
          />
        )}
        {isUserLoggedIn && <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} />} 
        {mounted && (
          <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} />
        )}
      </div>
    </div>
  );
};

export default DesktopNav;
