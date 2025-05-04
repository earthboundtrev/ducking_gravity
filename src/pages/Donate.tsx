import React from 'react';
import { motion } from 'framer-motion';
import { ImageCarousel } from '../components/ImageCarousel';
import { Heart, Instagram, Facebook, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { ContactForm } from '../components/ContactForm';
import { Link } from 'react-router-dom';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_live_51R0ljc2N3nCujaANOV24EcEeG9nfef2gWLc8A9ZloI3r1JndNxsObtHg3ypYKR8HtxIeRS8oANajkJdyas5UFQSm00GDkHTg1I');

const donateMedia = [
    {
        url: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_video.mp4',
        alt: 'Studio walkthrough video',
        type: 'video',
        thumbnail: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_picture_4.jpg' // Optional
    },
    {
    url: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_picture_1.jpg',
    alt: 'Future home of our aerial studio',
    type: 'image'
  },
  {
    url: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_picture_2.jpg',
    alt: 'Aerial performance showcase',
    type: 'image'
  },
  {
    url: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_picture_3.jpg',
    alt: 'Future home of our aerial studio',
    type: 'image'
  },
  {
    url: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_picture_4.jpg',
    alt: 'Aerial performance showcase',
    type: 'image'
  },
  {
    url: 'https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/inside_picture_5.jpg',
    alt: 'Future home of our aerial studio',
    type: 'image'
  }
];

const FUNDRAISING_GOAL = 4000;
const CURRENT_AMOUNT = 2559; // This is the value you'll update manually
const INTERVAL_AMOUNT = 1000; // Shows marks every $500

export function Donate() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDonation = () => {
    // Using the direct payment link as it's more flexible and reliable
    window.location.href = 'https://buy.stripe.com/4gwdR52l0gGa1UsdQR';
  };

  const scrollToDonate = () => {
    document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFundraising = () => {
    document.getElementById('fundraising-section')?.scrollIntoView({ 
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-[#3B82F6]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-2xl text-gray-200 max-w-3xl mx-auto font-light mb-10">
            Looking for eggs?{" "}
            <Link 
              to="/eggs"
              className="bg-[#22C55E] text-white px-4 py-2 rounded-lg hover:bg-[#16A34A] transition-colors inline-flex items-center gap-2"
            >
              Click here 🐔
            </Link>
          </p>
          <h1 className="text-6xl font-['Amatic_SC'] text-white mb-8">
            Help Us Build Our Dream Studio
          </h1>
          <p className="text-2xl text-gray-200 max-w-3xl mx-auto font-light mb-8">
            Together, we can create a space where everyone can learn to fly.
          </p>
          <div className="flex justify-center mb-8">
            <button
              onClick={scrollToDonate}
              className="donate-button"
            >
              Donate now!
            </button>
          </div>
        </motion.div>
        <p 
          onClick={scrollToFundraising}
          className="text-white/90 text-lg md:text-xl text-center mb-8 animate-fadeIn cursor-pointer group flex items-center justify-center gap-2 w-fit mx-auto"
        >
          Wow! We've already raised ${CURRENT_AMOUNT.toLocaleString()} of our ${FUNDRAISING_GOAL.toLocaleString()} goal!
          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
        </p>

        {/* Journey Section - Moved up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">I'm so excited!!!</h2>
          <div className="prose prose-lg max-w-none text-gray-200">
            <p className="mb-6">
              After months of searching, we have finally found a new home for Ducking Gravity, Culpeper's newest aerial arts studio!
            </p>
            <p className="mb-6">
              This space has everything we've been dreaming of—soaring ceilings, room for our community to thrive, and yes, the essentials like bathrooms, HVAC, and insulation (even a floor...imagine that! 😄). But to bring this dream to life, I need your help.
            </p>
            <p className="mb-6">
              We're on the brink of creating something truly special. The space is secured, but now we need professional rigging to make it safe and ready for everyone. This includes top-quality trusses, safety mats, and multiple rigging points to ensure we can all fly with confidence. I've chosen to work with VerticalArtDance, whose breathtaking installations, like <a href="https://www.verticalartdance.com/blog/neon-soul-yoga-chica" target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:text-[#16A34A] transition-colors">this one</a>, show their expertise in creating safe yet inspiring aerial environments.
            </p>
            <p className="mb-6">
              Together, we can transform this space into our space: a space that's not just safe for us as aerialists, but also a place that is safe for anyone and everyone to come together as a community and express themselves in a safe and open environment.
            </p>
            <p className="mb-6">
              My vision is more than just opening another aerial arts studio. It's about building a welcoming home for everyone to explore the art of flight and express themselves freely. Whether you're a complete beginner or a seasoned aerialist, scared of heights, or ready to soar, this will be a place where you can grow, challenge yourself, and reach new highs—literally and figuratively.
            </p>
            <p className="mb-6">
              Every contribution, big or small, brings us one step closer to making this dream a reality.
            </p>
            <p className="mb-6">
              To start soaring immediately, we're aiming to raise $4,000 for a <a href="https://www.jugglegear.com/aerial/aerial-rigs-and-frames/aerial-rig-mk3-20ft-16ft-12ft.html" target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:text-[#16A34A] transition-colors">portable rig</a> from JuggleGear, perfect not only for the studio but also for festivals and events.
            </p>
            <p className="mb-6">
              From there, anything else will go towards the design, purchase, and installation of circus trusses as well as the design and implementation of open space where our community can gather, be active, hang out, dream, and play together.
            </p>
            <p className="mb-6">
              Your support means so much to me and to the entire aerial community. Let's come together and build something incredible!
            </p>
            <p className="mb-6">Thank you, from the very bottom of my heart.</p>
          </div>
        </motion.div>

        {/* Image Carousel - Moved down */}
        <div className="mt-20">
          <ImageCarousel 
            media={donateMedia} 
            height="800px"
            objectFit="contain"
          />
        </div>
        
        {/* Second Donate Button */}
        <div className="text-center mt-12">
          <button
            onClick={scrollToDonate}
            className="donate-button"
          >
            Donate now!
          </button>
        </div>
      </section>

      {/* Fundraising Progress Section */}
      <section id="fundraising-section" className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Fundraising Progress</h3>
            <p className="text-xl text-gray-200">
              ${CURRENT_AMOUNT.toLocaleString()} raised of ${FUNDRAISING_GOAL.toLocaleString()} goal
            </p>
          </div>

          {/* Thermometer Container */}
          <div className="relative">
            {/* Background Track */}
            <div className="h-8 bg-white/10 rounded-full w-full mb-4">
              {/* Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(CURRENT_AMOUNT / FUNDRAISING_GOAL) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#22C55E] rounded-full"
              />
            </div>

            {/* Interval Markers */}
            <div className="relative h-6 w-full">
              {Array.from({ length: Math.floor(FUNDRAISING_GOAL / INTERVAL_AMOUNT) + 1 }).map((_, index) => {
                const value = index * INTERVAL_AMOUNT;
                const position = (value / FUNDRAISING_GOAL) * 100;
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2"
                    style={{ left: `${position}%` }}
                  >
                    <div className="h-2 w-0.5 bg-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-300">${value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="mt-8 text-center">
            <p className="text-gray-200">
              {((CURRENT_AMOUNT / FUNDRAISING_GOAL) * 100).toFixed(1)}% of our goal
            </p>
          </div>

          <div className="mt-8">
            <p className="text-white/80 text-sm italic">
              *Our fundraising total and percentage counter is not high-tech enough to automatically update (yet, our tech guy is working on it), but will be manually updated so everyone can see our progress!
            </p>
          </div>
        </motion.div>
      </section>

      {/* Donation Section - Added ID here */}
      <section id="donate-section" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-[#22C55E] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Support Our Growth</h3>
            <p className="text-gray-200 mb-8">
              Your contribution will help us purchase and install:
            </p>
            <ul className="text-left text-gray-200 mb-8 space-y-2">
              <li>• Professional-grade aerial rigging points</li>
              <li>• Safety-rated trusses and support structures</li>
              <li>• Premium crash mats for safe training</li>
              <li>• Essential safety equipment</li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleDonation}
              disabled={isProcessing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Donate now!
            </button>
          </div>
        </motion.div>
      </section>

      {/* Social Media Section */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-6">Follow Us to Keep Up with Our Progress</h3>
            <div className="flex justify-center gap-8">
              <a 
                href="https://instagram.com/duckinggravity" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white hover:text-[#22C55E] transition-all duration-300 hover:scale-105"
              >
                <Instagram className="h-8 w-8" />
                <span>@duckinggravity</span>
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61557121516331" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white hover:text-[#22C55E] transition-all duration-300 hover:scale-105"
              >
                <Facebook className="h-8 w-8" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Form Section */}
      <ContactForm 
        description="Want to learn more about our fundraising efforts or have questions about how you can help? We'd love to hear from you!"
        padding="py-8"
      />

    </div>
  );
} 