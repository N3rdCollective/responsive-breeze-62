
import { Link } from "react-router-dom";
import NavItem from "./NavItem";

interface DesktopNavProps {
  isScrolled: boolean;
}

const DesktopNav = ({ isScrolled }: DesktopNavProps) => {
  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        <NavItem to="/" isScrolled={isScrolled}>Home</NavItem>
        <NavItem to="/about" isScrolled={isScrolled}>About</NavItem>
        <NavItem to="/news" isScrolled={isScrolled}>News</NavItem>
        <NavItem to="/schedule" isScrolled={isScrolled}>Schedule</NavItem>
        <NavItem to="/personalities" isScrolled={isScrolled}>Personalities</NavItem>
        <NavItem to="/artists" isScrolled={isScrolled}>Artists</NavItem>
        <NavItem to="/members" isScrolled={isScrolled}>Forum</NavItem>
        <NavItem to="/chat" isScrolled={isScrolled}>Chat</NavItem>
        <NavItem to="/contact" isScrolled={isScrolled}>Contact</NavItem>
      </div>
    </div>
  );
};

export default DesktopNav;
