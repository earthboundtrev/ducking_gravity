import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';
// Remove next/image import since we're using React, not Next.js
// Use regular img tag instead of Next.js Image component

// Add interface for Footer props
interface FooterProps {
  logoSrc?: string; // Optional prop for custom logo
}

// Default logo URL
const DEFAULT_LOGO = "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/ducking-gravity-logo-green.png";

export function Footer({ logoSrc }: FooterProps) {
  return (
    <footer className="bg-[#E6E6FA] backdrop-filter backdrop-blur-md border-t border-[#42A5F5] text-black py-16 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-semibold mb-6 text-black uppercase tracking-wide">Contact</h3>
            <div className="space-y-4">
              <p className="flex items-center gap-3 justify-center md:justify-start">
                <Mail className="h-5 w-5 text-[#22C55E]" />
                <a 
                  href="mailto:duckinggravity@gmail.com"
                  className="hover:text-[#22C55E] transition-all duration-300"
                >
                  duckinggravity@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-3 justify-center md:justify-start">
                <MapPin className="h-5 w-5 text-[#22C55E]" />
                15532 Montanus Dr, Suite E<br />
                Culpeper, VA 22701
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-semibold mb-6 text-black uppercase tracking-wide">Follow Us</h3>
            <div className="flex gap-6 justify-center md:justify-start">
              <a 
                href="https://instagram.com/duckinggravity" 
                className="hover:text-[#22C55E] transition-all duration-300 hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61557121516331" 
                className="hover:text-[#22C55E] transition-all duration-300 hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-black/10 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Ducking Gravity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}