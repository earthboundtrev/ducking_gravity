import React from 'react';
import { ImageCarousel } from '../components/ImageCarousel';
import { motion } from 'framer-motion';

const silksImages = [
  {
    url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?ixlib=rb-4.0.3',
    alt: 'Aerial silk performance'
  },
  {
    url: 'https://images.unsplash.com/photo-1545544578-5ee45c44e679?ixlib=rb-4.0.3',
    alt: 'Aerial acrobatics'
  },
  {
    url: 'https://images.unsplash.com/photo-1596207891316-23851be3cc20?ixlib=rb-4.0.3',
    alt: 'Silk training'
  }
];

export function AerialSilks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00B7EB]/10 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">The Art of Aerial Silks</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the freedom of flight and the grace of dance, combined in the beautiful art of aerial silks.
          </p>
        </motion.div>

        <ImageCarousel images={silksImages} />
      </section>

      {/* Journey Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">My Journey with Aerial Silks</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              My aerial journey began over a decade ago when I first laid eyes on a mesmerizing silk performance. That moment ignited a passion that would transform not just my physical abilities, but my entire approach to movement and artistic expression.
            </p>
            <p className="mb-4">
              Through years of dedicated training, I've developed a teaching style that emphasizes both technical precision and creative freedom. Every student's journey is unique, and I take pride in helping each person discover their own strength and grace in the air.
            </p>
            <p>
              Whether you're a complete beginner or an experienced aerialist, our studio provides a supportive environment where you can explore, challenge yourself, and grow. We focus on safe progression, proper technique, and the joy of movement.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Class Information */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-[#00B7EB] rounded-lg shadow-xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Class Schedule</h3>
            <ul className="space-y-4">
              <li>
                <strong>Beginner Classes:</strong>
                <br />
                Monday & Wednesday 6:00 PM - 7:30 PM
              </li>
              <li>
                <strong>Intermediate:</strong>
                <br />
                Tuesday & Thursday 6:00 PM - 7:30 PM
              </li>
              <li>
                <strong>Advanced:</strong>
                <br />
                Saturday 10:00 AM - 12:00 PM
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gray-800 rounded-lg shadow-xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">What to Expect</h3>
            <ul className="space-y-4">
              <li>• Professional-grade equipment and safety measures</li>
              <li>• Small class sizes for personalized attention</li>
              <li>• Progressive skill development</li>
              <li>• Supportive community atmosphere</li>
              <li>• Regular performance opportunities</li>
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  );
}