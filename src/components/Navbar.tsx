import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Feather, Egg, Info, Menu, X, Heart } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-[#1E3A5F]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link 
          to="/" 
          className="text-white text-2xl font-bold flex items-center gap-3 hover:text-[#22C55E] transition-all duration-300"
        >
          <img 
            src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/ducking-gravity-logo-green.png"
            alt="Ducking Gravity Logo"
            className="h-8 w-8"
          />
          <span className="text-white">Ducking Gravity</span>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white hover:text-[#22C55E] transition-all duration-300"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8">
          {/* Original navigation links commented out
          <Link
            to="/"
            className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2 
                      ${isActive('/') ? 'border-b-2 border-[#22C55E]' : ''}`}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          
          <Link
            to="/about"
            className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                      ${isActive('/about') ? 'border-b-2 border-[#22C55E]' : ''}`}
          >
            <Info className="h-5 w-5" />
            About
          </Link>
          
          <Link
            to="/aerial-silks"
            className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                      ${isActive('/aerial-silks') ? 'border-b-2 border-[#22C55E]' : ''}`}
          >
            <Feather className="h-5 w-5" />
            Aerial Silks
          </Link>
          */}

          {/* New Donate link */}
          <Link
            to="/donate"
            className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                      ${isActive('/donate') ? 'border-b-2 border-[#22C55E]' : ''}`}
          >
            <Heart className="h-5 w-5" />
            Support Us
          </Link>

          {/* <Link
            to="/eggs"
            className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                      ${isActive('/eggs') ? 'border-b-2 border-[#22C55E]' : ''}`}
          >
            <Egg className="h-5 w-5" />
            Hobby Farm
          </Link> */}
        </div>

        {/* Mobile Navigation */}
        <div className={`absolute top-full left-0 right-0 bg-[#1E3A5F]/95 backdrop-blur-md md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="flex flex-col p-4 space-y-4">
            {/* Original mobile navigation links commented out
            <Link
              to="/"
              className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2 
                        ${isActive('/') ? 'text-[#22C55E]' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            
            <Link
              to="/about"
              className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                        ${isActive('/about') ? 'text-[#22C55E]' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Info className="h-5 w-5" />
              About
            </Link>
            
            <Link
              to="/aerial-silks"
              className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                        ${isActive('/aerial-silks') ? 'text-[#22C55E]' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Feather className="h-5 w-5" />
              Aerial Silks
            </Link>
            */}
            
            {/* New Donate link for mobile */}
            <Link
              to="/donate"
              className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                        ${isActive('/donate') ? 'text-[#22C55E]' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="h-5 w-5" />
              Support Us
            </Link>
            
            {/* <Link
              to="/eggs"
              className={`flex items-center gap-2 text-white hover:text-[#22C55E] transition-all duration-300 py-2
                        ${isActive('/eggs') ? 'text-[#22C55E]' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Egg className="h-5 w-5" />
              Hobby Farm
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
}