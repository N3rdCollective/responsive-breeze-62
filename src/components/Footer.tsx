
import React from "react";
import { Link } from "react-router-dom";
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
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">
              {settings?.site_title || "Radio Station"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {settings?.site_tagline || "Your favorite radio station bringing you the best music and entertainment."}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Contact Us</h3>
            <div className="space-y-3">
              {settings?.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <a 
                    href={`tel:${settings.contact_phone}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Social & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium text-primary mb-2">Legal & Privacy</h4>
              <ul className="space-y-1">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-xs flex items-center gap-1"
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
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm text-center sm:text-left">
            © {new Date().getFullYear()} {settings?.site_title || "Radio Station"}. All rights reserved.
            {settings?.copyright_text && (
              <span className="block sm:inline sm:ml-2">
                {settings.copyright_text}
              </span>
            )}
          </p>
          <p className="text-muted-foreground/70 text-xs">
            Built with ❤️ for music lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
