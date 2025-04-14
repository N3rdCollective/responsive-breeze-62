import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";
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
    <div className="hidden md:flex items-center space-x-8">
      {navigationItems.map((item) => (
        <NavItem 
          key={item.path + item.label}
          path={item.path}
          label={item.label}
          isActive={isActive(item.path)}
          isHomePage={isHomePage}
          isScrolled={isScrolled}
          onClick={item.onClick}
        />
      ))}
      <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
      {mounted && (
        <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} />
      )}
    </div>
  );
};

export default DesktopNav;
