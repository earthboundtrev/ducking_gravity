import React from 'react';
import { motion } from 'framer-motion';

export function Eggs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-[#3B82F6]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-bold text-white mb-8 uppercase tracking-wider text-shadow-glow">
            Farm Fresh Eggs
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">
            Sustainably raised, naturally delicious eggs from our happy, free-range hens.
          </p>
        </motion.div>
      </section>

      {/* Farm Practices */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                     border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
          >
            <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">Our Farm Practices</h2>
            <div className="prose prose-lg max-w-none text-gray-200">
              <p className="mb-4">
                Our hens live their best lives on our small, sustainable farm. They enjoy:
              </p>
              <ul className="space-y-4 mb-4">
                <li>Our hens spend their days roaming freely across fresh pastures, scratching in the dirt for insects and seeds, and taking dust baths in the sunshine. This natural lifestyle allows them to express their innate behaviors and stay healthy.</li>
                <li>We practice rotational grazing, moving our hens to fresh pasture regularly. This approach not only provides them with new foraging opportunities but also naturally controls pests and fertilizes our land, creating a harmonious ecosystem that benefits both the chickens and the soil.</li>
              </ul>
              <p>
                Happy hens lay the most nutritious eggs, and our careful attention to their well-being shows in every golden yolk. When you crack open one of our eggs, you'll notice the difference in both color and taste - it's the result of our hens' natural diet and stress-free lifestyle.
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
              className="rounded-lg shadow-[0_8px_30px_rgba(59,130,246,0.1)] w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Pricing & Ordering */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">Egg Availability & Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#22C55E]">Current Pricing</h3>
              <ul className="space-y-4 text-gray-200">
                <li>• Half Dozen: $4.00</li>
                <li>• Full Dozen: $7.00</li>
                <li>• Monthly Subscription (4 dozen): $25.00</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#22C55E]">How to Order</h3>
              <p className="text-gray-200">
                Eggs are available for pickup at our farm stand Wednesday through Sunday, 9 AM to 6 PM. Monthly subscribers receive priority and guaranteed availability.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}