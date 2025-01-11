import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* About Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About the Coach</h1>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <img
                src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/441558738_1435909737050000_8855003634105954121_n.jpg"
                alt="Aerial performer"
                className="rounded-lg shadow-lg w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Welcome to Ducking Gravity! I'm Christina, your aerial arts coach and sustainable farming enthusiast. I believe in the power of connecting mind, body, and nature, which is why I've created this unique space where art meets earth.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                My aerial journey began just four years ago, and it's shown me that anyone can discover the joy of aerial arts, regardless of their background. I've had the privilege of guiding dozens of students from their very first climb to performing in showcases, proving that with dedication and the right support, amazing things are possible.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                As part of my holistic approach to wellness, I maintain a small, sustainable farm where we produce fresh, organic eggs. I believe that knowing where your food comes from is just as important as how you move your body. Our locally produced eggs aren't just fresher and more nutritious – they come from hens that are cared for with attention and respect, resulting in eggs that simply taste better. This farm-to-table connection helps complete the circle of mindful living that I strive to share with my community.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Aerial Silks & Farm Sections */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Aerial Silks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#00B7EB] rounded-lg shadow-xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Aerial Silks</h2>
            <p className="mb-6">
              Discover the art of defying gravity through aerial silks. Our classes combine strength, grace, and artistic expression in a supportive environment suitable for all skill levels.
            </p>
            <Link
              to="/aerial-silks"
              className="inline-block bg-white text-[#00B7EB] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Farm & Eggs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#008000] rounded-lg shadow-xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Farm Fresh Eggs</h2>
            <p className="mb-6">
              Our happy hens produce the freshest, most nutritious eggs you'll find. We believe in sustainable farming practices that benefit both our community and the environment.
            </p>
            <Link
              to="/eggs"
              className="inline-block bg-white text-[#008000] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}