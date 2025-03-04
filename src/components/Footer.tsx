import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Feather } from 'lucide-react';
// Remove next/image import since we're using React, not Next.js
// Use regular img tag instead of Next.js Image component

export function Footer() {
  return (
    <footer className="bg-black/90 backdrop-blur-md border-t border-white/10 text-white py-16 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/ducking-gravity-logo-green.png"
              alt="Ducking Gravity Logo"
              width={200}
              height={50}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-6 text-[#22C55E] uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-[#22C55E] transition-all duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#22C55E] transition-all duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/aerial-silks" className="hover:text-[#22C55E] transition-all duration-300">
                  Aerial Silks
                </Link>
              </li>
              <li>
                <Link to="/eggs" className="hover:text-[#22C55E] transition-all duration-300">
                  Hobby Farm
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-6 text-[#22C55E] uppercase tracking-wide">Contact</h3>
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
                Culpeper, Virginia
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-6 text-[#22C55E] uppercase tracking-wide">Follow Us</h3>
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
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Ducking Gravity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}