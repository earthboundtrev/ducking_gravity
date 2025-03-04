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
            Our Hobby Farm's Hen Family
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">
            Meet our free-range hens and learn about our sustainable farming practices on our small hobby farm.
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

      {/* Farm Information */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">Visit Our Farm</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#22C55E]">Follow Our Journey</h3>
              <p className="text-gray-200 mb-4">
                Want to learn more about our small hobby farm? Follow our daily adventures and farm life on Instagram.
              </p>
              <a 
                href="https://instagram.com/duckinggravity" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#22C55E] hover:text-[#22C55E]/80 transition-colors duration-200"
              >
                @duckinggravity
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.09 1.064.077 1.791.232 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.233.636.388 1.363.465 2.427.077 1.067.09 1.407.09 4.123v.08c0 2.643-.012 2.987-.09 4.043-.077 1.064-.232 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.233-1.363.388-2.427.465-1.067.077-1.407.09-4.123.09h-.08c-2.643 0-2.987-.012-4.043-.09-1.064-.077-1.791-.232-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.233-.636-.388-1.363-.465-2.427-.077-1.024-.087-1.379-.087-4.808v-.63c0-2.43.013-2.784.087-4.808.077-1.064.232-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.233 1.363-.388 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}