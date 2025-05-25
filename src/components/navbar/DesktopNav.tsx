
import { Link } from "react-router-dom";
import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import { NavigationItem } from "@/types/profile";
import { Shield } from "lucide-react"; // Import Shield icon
import { cn } from "@/lib/utils";

interface DesktopNavProps {
  navigationItems: NavigationItem[];
  isActive: (path: string) => boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  mounted: boolean;
  isUserLoggedIn: boolean;
  staffName?: string | null; // Add staffName prop
}

const DesktopNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted,
  isUserLoggedIn,
  staffName // Destructure staffName
}: DesktopNavProps) => {
  const navItemBaseStyling = (active: boolean) => 
    active
    ? 'text-[#FFD700] dark:text-[#FFD700]'
    : isHomePage && !isScrolled
      ? 'text-white hover:text-[#FFD700]'
      : 'text-[#333333] dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]';
  
  const navItemCommonClasses = 'font-medium transition-colors duration-200 px-3 py-2 flex items-center';

  return (
    <div className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => (
        <NavItem 
          key={item.path + item.label}
          path={item.path}
          label={item.label}
          isActive={isActive(item.path)}
          isHomePage={isHomePage}
          isScrolled={isScrolled}
          onClick={item.onClick}
          className="px-3 py-2"
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
        {isUserLoggedIn && <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} />} 
        {mounted && (
          <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} />
        )}
      </div>
    </div>
  );
};

export default DesktopNav;

