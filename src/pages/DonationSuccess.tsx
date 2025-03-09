import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DonationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-lg p-12 text-center max-w-lg mx-4"
      >
        <Heart className="h-16 w-16 text-[#22C55E] mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
        <p className="text-gray-200 mb-8">
          Your generous donation brings us one step closer to creating an amazing space for our aerial arts community.
        </p>
        <Link
          to="/"
          className="bg-[#22C55E] text-white px-8 py-4 rounded-lg font-semibold inline-block
                   hover:bg-[#22C55E]/80 transition-all duration-300"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
} 