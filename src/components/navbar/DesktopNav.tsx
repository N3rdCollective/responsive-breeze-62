
import { Link } from "react-router-dom";
import NavItem from "./NavItem";

interface DesktopNavProps {
  isScrolled: boolean;
}

const DesktopNav = ({ isScrolled }: DesktopNavProps) => {
  const isHomePage = false; // Desktop nav is not on home page context

  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        <NavItem path="/" label="Home" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/about" label="About" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/news" label="News" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/schedule" label="Schedule" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/personalities" label="Personalities" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/artists" label="Artists" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/members" label="Forum" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/chat" label="Chat" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
        <NavItem path="/contact" label="Contact" isActive={false} isHomePage={isHomePage} isScrolled={isScrolled} />
      </div>
    </div>
  );
};

export default DesktopNav;
