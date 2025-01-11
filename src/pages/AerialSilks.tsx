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
              Welcome to our aerial arts community! I'm Christina, and I'm passionate about sharing the transformative power of aerial silks. What started as a spark of inspiration when I first discovered aerial arts has grown into a deep love for both performing and teaching this beautiful art form.
            </p>
            <p className="mb-4">
              As an instructor, I've had the incredible privilege of guiding students from their very first climb to performing in showcases. My teaching philosophy centers around creating a supportive environment where everyone can thrive, regardless of their background or experience level. I've seen firsthand how aerial arts can build not just physical strength, but also confidence, creativity, and a sense of community.
            </p>
            <p>
              I believe that aerial arts are for everyone, and I'm committed to making this beautiful form of movement accessible to all who want to explore it. Our studio emphasizes safe progression, proper technique, and most importantly, the joy of movement. Whether you're looking to perform professionally or simply want to try something new, there's a place for you here in our aerial family.
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