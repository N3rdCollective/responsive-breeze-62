
import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
import NotificationBell from "@/components/notifications/NotificationBell"; // Added import
import { NavigationItem } from "@/types/profile";

interface DesktopNavProps {
  navigationItems: NavigationItem[];
  isActive: (path: string) => boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  mounted: boolean;
}

const DesktopNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted
}: DesktopNavProps) => {
  return (
    <div className="hidden md:flex items-center space-x-1"> {/* Adjusted space-x for more items */}
      {navigationItems.map((item) => (
        <NavItem 
          key={item.path + item.label}
          path={item.path}
          label={item.label}
          isActive={isActive(item.path)}
          isHomePage={isHomePage}
          isScrolled={isScrolled}
          onClick={item.onClick}
          className="px-3 py-2" // Standardize padding if needed
        />
      ))}
      <div className="flex items-center space-x-1 ml-4"> {/* Group right-side icons */}
        <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
        <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} /> 
        {mounted && (
          <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} />
        )}
      </div>
    </div>
  );
};

export default DesktopNav;

