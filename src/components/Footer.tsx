
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Us</h3>
            <p className="text-gray-600">
              We bring you the best in music, entertainment, and news.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Home</a></li>
              <li><a href="#personalities" className="text-gray-600 hover:text-black transition-colors">Personalities</a></li>
              <li><a href="#about" className="text-gray-600 hover:text-black transition-colors">About</a></li>
              <li><a href="#news" className="text-gray-600 hover:text-black transition-colors">News</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>123 Radio Street</li>
              <li>City, State 12345</li>
              <li>contact@radio.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Radio Station. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
