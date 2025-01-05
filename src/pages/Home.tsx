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
                className="rounded-lg shadow-lg w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Welcome to Ducking Gravity! I'm Christina, your aerial arts coach and sustainable farming enthusiast. With over a decade of experience in aerial silks and a passion for connecting mind, body, and nature, I've created this unique space where art meets earth.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                My journey began in the world of dance and gymnastics, eventually leading me to discover the transformative power of aerial arts. Today, I share this passion with students while also maintaining a small, sustainable farm where we produce fresh, organic eggs.
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