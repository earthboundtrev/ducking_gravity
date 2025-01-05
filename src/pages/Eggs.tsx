import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export function Eggs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#008000]/10 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">Farm Fresh Eggs</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sustainably raised, naturally delicious eggs from our happy, free-range hens.
          </p>
        </motion.div>
      </section>

      {/* Farm Practices */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Farm Practices</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Our hens live their best lives on our small, sustainable farm. They enjoy:
              </p>
              <ul className="space-y-2 mb-4">
                <li>Free-range access to fresh pasture</li>
                <li>Natural pest control through rotation</li>
              </ul>
              <p>
                Happy hens lay the most nutritious eggs, and our careful attention to their well-being shows in every golden yolk.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1518214598173-1666bc921d66?ixlib=rb-4.0.3"
              alt="Happy hens on pasture"
              className="rounded-lg shadow-xl w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Infographic Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-[#008000] rounded-lg shadow-xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Sustainable Cycle</h2>
            <p className="text-lg">
              Click the image below to download our detailed infographic about our sustainable farming practices.
            </p>
          </div>
          
          <div className="relative group cursor-pointer">
            {/* Placeholder for infographic - in production, replace with actual infographic */}
            <div className="bg-white/10 rounded-lg p-8 text-center">
              <Download className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-semibold">
                Download Our Farm Practices Infographic
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing & Ordering */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Egg Availability & Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Current Pricing</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• Half Dozen: $4.00</li>
                <li>• Full Dozen: $7.00</li>
                <li>• Monthly Subscription (4 dozen): $25.00</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">How to Order</h3>
              <p className="text-gray-600">
                Eggs are available for pickup at our farm stand Wednesday through Sunday, 9 AM to 6 PM. Monthly subscribers receive priority and guaranteed availability.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}