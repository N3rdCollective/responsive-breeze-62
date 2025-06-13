
import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/navbar/ThemeToggle";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Shield } from "lucide-react";
import SponsorsSection from "@/components/footer/SponsorsSection";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const Footer = () => {
  const { settings } = useSystemSettings();

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "News", href: "/news" },
    { name: "Schedule", href: "/schedule" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Privacy Settings", href: "/privacy-settings", icon: Shield },
  ];

  return (
    <footer className="bg-[#1a1a1a] dark:bg-[#0A0A0A] text-white py-12 border-t border-[#333]">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#FFD700]">
              {settings?.site_name || "Radio Station"}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {settings?.site_description || "Your favorite radio station bringing you the best music and entertainment."}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">Theme:</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FFD700]">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-[#FFD700] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FFD700]">Contact Us</h3>
            <div className="space-y-3">
              {settings?.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#FFD700]" />
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="text-gray-300 hover:text-[#FFD700] transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-[#FFD700]" />
                  <a 
                    href={`tel:${settings.contact_phone}`}
                    className="text-gray-300 hover:text-[#FFD700] transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              {settings?.contact_address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#FFD700] mt-0.5" />
                  <span className="text-gray-300">{settings.contact_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FFD700]">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#333] hover:bg-[#FFD700] hover:text-black transition-all duration-200 rounded"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium text-[#FFD700] mb-2">Legal & Privacy</h4>
              <ul className="space-y-1">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-[#FFD700] transition-colors text-xs flex items-center gap-1"
                    >
                      {link.icon && <link.icon className="h-3 w-3" />}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sponsors/Affiliates Section */}
        <SponsorsSection />

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#333] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} {settings?.site_name || "Radio Station"}. All rights reserved.
            {settings?.copyright_text && (
              <span className="block sm:inline sm:ml-2">
                {settings.copyright_text}
              </span>
            )}
          </p>
          <p className="text-gray-500 text-xs">
            Built with ❤️ for music lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
