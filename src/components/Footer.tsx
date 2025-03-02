
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F5F5F5] dark:bg-[#333333] border-t border-[#666666]/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD700]">About Us</h3>
            <p className="text-gray-700 dark:text-white">
              We bring you the best in music, entertainment, and news.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">Home</a></li>
              <li><a href="/personalities" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">Personalities</a></li>
              <li><a href="/about" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">About</a></li>
              <li><a href="/news" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">News</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Contact</h3>
            <ul className="space-y-2 text-gray-700 dark:text-white">
              <li>123 Radio Street</li>
              <li>City, State 12345</li>
              <li>contact@radio.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
            <div>
              <a href="/staff/login" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors text-sm">Staff Login</a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#666666]/20 dark:border-white/10 text-center text-gray-700 dark:text-white">
          <p>&copy; {new Date().getFullYear()} Radio Station. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
