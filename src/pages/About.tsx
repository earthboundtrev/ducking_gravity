import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-black">
      {/* About Section */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-lg shadow-[0_0_40px_rgba(59,130,246,0.1)] overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row"> {/* Container for image and content */}
            {/* Image container - takes full width on mobile, 40% on desktop */}
            <div className="w-full lg:w-2/5 h-[300px] lg:h-auto relative">
              <img
                src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/441558738_1435909737050000_8855003634105954121_n.jpg"
                alt="Christina with a duck"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content container - takes full width on mobile, 60% on desktop */}
            <div className="p-8 lg:p-12 lg:w-3/5">
              <h1 className="text-4xl font-bold text-white mb-8 uppercase tracking-wider text-shadow-glow">
                About the Coach
              </h1>
              <div className="prose prose-lg max-w-none text-gray-200">
                <p>
                  Welcome to Ducking Gravity! I'm Christina, your aerial arts coach and sustainable farming enthusiast. I believe in the power of connecting mind, body, and nature, which is why I've created this unique space where art meets earth.
                </p>
                <br/>
                <p>
                  My aerial journey began just four years ago, and it's shown me that anyone can discover the joy of aerial arts, regardless of their background. I've had the privilege of guiding dozens of students from their very first climb to performing in showcases, proving that with dedication and the right support, amazing things are possible.
                </p>
                <br/>
                <p>
                  As part of my holistic approach to wellness, I maintain a small, sustainable farm where we produce fresh, organic eggs. I believe that knowing where your food comes from is just as important as how you move your body. Our locally produced eggs aren't just fresher and more nutritious – they come from hens that are cared for with attention and respect, resulting in eggs that simply taste better. This farm-to-table connection helps complete the circle of mindful living that I strive to share with my community.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#3B82F6]/10 backdrop-blur-md rounded-lg shadow-[0_0_40px_rgba(59,130,246,0.1)] p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">
              Aerial Arts Training
            </h2>
            <p className="text-gray-200">
              Discover the art of defying gravity through aerial silks. Our classes combine strength, grace, and artistic expression in a supportive environment suitable for all skill levels.
            </p>
            <Link
              to="/aerial-silks"
              className="inline-block mt-6 bg-[#22C55E] text-white px-8 py-3 rounded-lg font-semibold 
                       hover:bg-[#22C55E]/80 transition-all duration-300 hover:scale-105"
            >
              Learn More
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#3B82F6]/10 backdrop-blur-md rounded-lg shadow-[0_0_40px_rgba(59,130,246,0.1)] p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">
              Sustainable Farming
            </h2>
            <p className="text-gray-200">
              Our happy hens produce the freshest, most nutritious eggs you'll find. We believe in sustainable farming practices that benefit both our community and the environment.
            </p>
            <Link
              to="/eggs"
              className="inline-block mt-6 bg-[#22C55E] text-white px-8 py-3 rounded-lg font-semibold 
                       hover:bg-[#22C55E]/80 transition-all duration-300 hover:scale-105"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 