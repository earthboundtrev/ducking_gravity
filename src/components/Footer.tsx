import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#00B7EB] transition-colors">Home</Link></li>
              <li><Link to="/aerial-silks" className="hover:text-[#00B7EB] transition-colors">Aerial Silks</Link></li>
              <li><Link to="/eggs" className="hover:text-[#008000] transition-colors">Farm Fresh Eggs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                duckinggravity@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Culpeper, Virginia
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="https://instagram.com/duckinggravity" className="hover:text-[#00B7EB] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61557121516331" className="hover:text-[#00B7EB] transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; {new Date().getFullYear()} Ducking Gravity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}