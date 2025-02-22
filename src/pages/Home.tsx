import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Heart } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-[#3B82F6]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/20221231_113900.jpg"
            alt="Aerial performance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A5F]/80 to-[#3B82F6]/80" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 uppercase tracking-wider text-shadow-glow">
              Explore Your Passion for Flight
              <span className="block text-[#22C55E] mt-2">in a Community You'll Love</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl font-light">
              Ducking Gravity offers more than exceptional aerial arts training. We're a unique community where artistry meets earth, empowering every member to learn, grow, and soar.
            </p>
            <div className="flex gap-4">
              <Link
                to="/aerial-silks"
                className="bg-[#22C55E] text-white px-8 py-4 rounded-lg font-semibold text-lg 
                         hover:bg-[#22C55E]/80 transition-all duration-300 hover:scale-105 
                         flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg 
                         hover:bg-white/20 transition-all duration-300 backdrop-blur-sm 
                         flex items-center gap-2"
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden card-hover
                     border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
          >
            <div className="relative aspect-[3/4] w-full bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/VideoCapture_20230101-220011.jpg" 
                  alt="Inclusive Environment"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="p-8">
              <Users className="h-8 w-8 text-[#22C55E] mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
                Inclusive Environment
              </h3>
              <p className="text-gray-200">
                We believe aerial arts are for everyone. Our studio welcomes all skill levels and backgrounds, creating a space where every individual can thrive and discover their potential.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden card-hover
                     border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
          >
            <div className="relative aspect-[3/4] w-full bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/VideoCapture_20230101-220011.jpg" 
                  alt="Expert Instruction"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="p-8">
              <Star className="h-8 w-8 text-[#22C55E] mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
                Expert Instruction
              </h3>
              <p className="text-gray-200">
                Learn from experienced instructors who prioritize safety, proper technique, and personal growth. From beginners to advanced performers, we'll help you achieve your aerial goals.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden card-hover
                     border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
          >
            <div className="relative aspect-[3/4] w-full bg-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/VideoCapture_20230101-220011.jpg" 
                  alt="Holistic Approach"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="p-8">
              <Heart className="h-8 w-8 text-[#22C55E] mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
                Holistic Approach
              </h3>
              <p className="text-gray-200">
                Beyond aerial arts, we embrace a connection to nature through our sustainable farm. Experience the unique blend of artistic expression and earthly connection.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}