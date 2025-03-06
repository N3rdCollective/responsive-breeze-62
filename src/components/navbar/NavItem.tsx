
import { Link } from "react-router-dom";

interface NavItemProps {
  path: string;
  label: string;
  isActive: boolean;
  isHomePage: boolean;
  isScrolled: boolean;
}

const NavItem = ({ path, label, isActive, isHomePage, isScrolled }: NavItemProps) => {
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Link 
      to={path} 
      onClick={handleClick}
      className={`
        ${isActive 
          ? 'text-[#FFD700] dark:text-[#FFD700]' 
          : isHomePage && !isScrolled
            ? 'text-white hover:text-[#FFD700]'
            : 'text-[#333333] dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]'
        }
        font-medium transition-colors duration-200
      `}
    >
      {label}
    </Link>
  );
};

export default NavItem;
