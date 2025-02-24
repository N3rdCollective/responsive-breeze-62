
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl font-semibold">Logo</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#" active>Home</NavLink>
            <NavLink href="#personalities">Personalities</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#news">News</NavLink>
            <Button
              className="bg-black text-white hover:bg-gray-800"
            >
              Listen Live
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white/80 backdrop-blur-md shadow-lg animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink href="#" active>Home</MobileNavLink>
            <MobileNavLink href="#personalities">Personalities</MobileNavLink>
            <MobileNavLink href="#about">About</MobileNavLink>
            <MobileNavLink href="#news">News</MobileNavLink>
            <div className="px-3 py-2">
              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Listen Live
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) => (
  <a
    href={href}
    className={`text-sm font-medium transition-colors hover:text-black ${
      active ? 'text-black' : 'text-gray-600'
    }`}
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) => (
  <a
    href={href}
    className={`block px-3 py-2 text-base font-medium transition-colors ${
      active ? 'text-black' : 'text-gray-600'
    }`}
  >
    {children}
  </a>
);

export default Navbar;
