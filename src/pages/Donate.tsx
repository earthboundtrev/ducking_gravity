import React from 'react';
import { motion } from 'framer-motion';
import { ImageCarousel } from '../components/ImageCarousel';
import { Heart } from 'lucide-react';
// import { getStripe } from '../utils/stripe';
import { useState } from 'react';

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

export function Donate() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const handleDonation = async (amount: string) => {
    // Temporary handler for testing
    console.log('Donation amount:', amount);
    alert(`Test donation of ${amount === 'custom' ? `$${customAmount}` : amount}`);

    /* Commented out Stripe implementation
    try {
      setIsProcessing(true);
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          customAmount: amount === 'custom' ? parseFloat(customAmount) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
    */
  };

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
          <h1 className="text-6xl font-bold text-white mb-8 uppercase tracking-wider text-shadow-glow">
            Help Us Build Our Dream Studio
          </h1>
          <p className="text-2xl text-gray-200 max-w-3xl mx-auto font-light">
            Together, we can create a space where everyone can learn to fly.
          </p>
        </motion.div>

        {/* Journey Section - Moved up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover mb-20
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">I'm so excited!!!</h2>
          <div className="prose prose-lg max-w-none text-gray-200">
            <p className="mb-6">
              Y'all, I can hardly contain my excitement! After months of searching, we've finally secured the perfect location for our aerial arts studio. This space has everything we've been dreaming of - soaring ceilings, and enough room for our community to grow (plus bathrooms, HVAC, insulation, a floor...ya know...😁). But here's where I need your help to bring this vision to life.
            </p>
            <p className="mb-6">
              Right now, we're standing at the edge of something amazing. The space is secured, but we need proper rigging to make it safe for everyone. I'm talking about professional-grade trusses, safety mats, and rigging points that will let us all fly with complete confidence. Together, we can create a studio that's not just safe, but exceptional.
            </p>
            <p className="mb-6">
              My vision isn't just about creating another aerial studio - it's about building a home where everyone feels welcome to explore the aerial arts. Whether you're a complete beginner or an experienced aerialist, this space will be yours to grow, challenge yourself, and discover just how high you can soar.
            </p>
            <p>
              Every donation, no matter the size, brings us closer to making this dream a reality. Your support means the world to me and to our entire aerial community. Let's build something extraordinary together!
            </p>
          </div>
        </motion.div>

        {/* Image Carousel - Moved down */}
        <ImageCarousel 
          media={donateMedia} 
          height="800px"
          objectFit="contain"
        />
      </section>

      {/* Donation Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
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

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleDonation('small')}
              disabled={isProcessing}
              className="bg-white/10 text-white p-6 rounded-lg hover:bg-white/20 transition-colors"
            >
              $25
            </button>
            <button
              onClick={() => handleDonation('medium')}
              disabled={isProcessing}
              className="bg-white/10 text-white p-6 rounded-lg hover:bg-white/20 transition-colors"
            >
              $50
            </button>
            <button
              onClick={() => handleDonation('large')}
              disabled={isProcessing}
              className="bg-white/10 text-white p-6 rounded-lg hover:bg-white/20 transition-colors"
            >
              $100
            </button>
            <div className="relative md:relative static">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full bg-white/10 text-white p-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
              <button
                onClick={() => handleDonation('custom')}
                disabled={isProcessing || !customAmount}
                className="md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 hidden md:block bg-[#22C55E] text-white px-4 py-2 rounded"
              >
                Donate
              </button>
            </div>
            {/* Mobile-only donate button */}
            <button
              onClick={() => handleDonation('custom')}
              disabled={isProcessing || !customAmount}
              className="md:hidden col-span-2 bg-[#22C55E] text-white px-4 py-2 rounded mx-auto mt-2 w-1/2"
            >
              Donate
            </button>
          </div>

          {isProcessing && (
            <div className="text-center text-gray-200">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2" />
              <p>Processing...</p>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
} 