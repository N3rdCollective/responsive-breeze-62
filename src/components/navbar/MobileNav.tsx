
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NavItem from "./NavItem";
import ThemeToggle from "./ThemeToggle";
import ListenButton from "./ListenButton";

interface NavigationItem {
  path: string;
  label: string;
}

interface MobileNavProps {
  navigationItems: NavigationItem[];
  isActive: (path: string) => boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  mounted: boolean;
}

const MobileNav = ({ 
  navigationItems, 
  isActive, 
  isHomePage, 
  isScrolled,
  mounted
}: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0);
    setIsOpen(false);
  };
  
  return (
    <div className="md:hidden flex items-center space-x-4">
      <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`
              ${isHomePage && !isScrolled
                ? "text-white hover:text-[#FFD700]"
                : "text-[#333333] hover:text-[#FFD700]"
              }
              dark:text-white dark:hover:text-[#FFD700]
            `}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="text-left text-xl font-bold text-[#333333] dark:text-[#FFD700]">
              Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-4 mt-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  ${isActive(item.path)
                    ? 'text-[#FFD700] dark:text-[#FFD700]'
                    : 'text-[#333333] dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]'
                  }
                  text-lg font-medium transition-colors duration-200
                `}
              >
                {item.label}
              </Link>
            ))}
            {mounted && (
              <ThemeToggle isHomePage={isHomePage} isScrolled={isScrolled} mobile />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
