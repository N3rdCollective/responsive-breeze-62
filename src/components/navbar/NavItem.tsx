
import { Link } from "react-router-dom";

interface NavItemProps {
  path: string;
  label: string;
  isActive: boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  onClick?: () => void;
}

const NavItem = ({ path, label, isActive, isHomePage, isScrolled, onClick }: NavItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo(0, 0);
    }
  };

  if (path === "#" && onClick) {
    return (
      <button
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
      </button>
    );
  }

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
