import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Feather, Egg } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-gradient-to-r from-[#00B7EB] to-[#008000] p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
          <Feather className="h-8 w-8" />
          Ducking Gravity
        </Link>
        
        <div className="flex gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 text-white hover:text-gray-200 transition-colors ${
              isActive('/') ? 'border-b-2 border-white' : ''
            }`}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          
          <Link
            to="/aerial-silks"
            className={`flex items-center gap-2 text-white hover:text-gray-200 transition-colors ${
              isActive('/aerial-silks') ? 'border-b-2 border-white' : ''
            }`}
          >
            <Feather className="h-5 w-5" />
            Aerial Silks
          </Link>
          
          <Link
            to="/eggs"
            className={`flex items-center gap-2 text-white hover:text-gray-200 transition-colors ${
              isActive('/eggs') ? 'border-b-2 border-white' : ''
            }`}
          >
            <Egg className="h-5 w-5" />
            Farm Fresh Eggs
          </Link>
        </div>
      </div>
    </nav>
  );
}