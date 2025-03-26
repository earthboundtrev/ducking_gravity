import React from 'react';
import { motion } from 'framer-motion';
import { ImageCarousel } from '../components/ImageCarousel';
import { ContactForm } from '../components/ContactForm';
import { ChevronRight } from 'lucide-react';

// You'll need to add your image arrays here for each section
const freshEggsMedia = [
  {
    url: "https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?q=80&w=800", // Brown eggs in basket
    alt: "Fresh farm eggs in a rustic basket"
  },
  {
    url: "https://images.unsplash.com/photo-1482510356941-d087154c2931?q=80&w=800", // Eggs on counter
    alt: "Farm fresh eggs displayed on kitchen counter"
  },
  {
    url: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?q=80&w=800", // Different colored eggs
    alt: "Variety of colored fresh eggs"
  }
];

const birdsMedia = [
  {
    url: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800", // Free range chickens
    alt: "Free range chickens in the yard"
  },
  {
    url: "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?q=80&w=800", // Rhode Island Red
    alt: "Rhode Island Red chicken"
  }
];

const farmMedia = [
  {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800", // Sunrise farm
    alt: "Beautiful sunrise over the farm"
  },
  {
    url: "https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=800", // Farm landscape
    alt: "Scenic view of the farm grounds"
  }
];

export function Eggs() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A5F] to-[#3B82F6]">
      {/* Hero Section with Page Links */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-8 uppercase tracking-wider">
            Our Hobby Farm!
          </h1>
          <ul className="text-xl text-gray-200 max-w-3xl mx-auto font-light space-y-2">
            <li>
              <button 
                onClick={() => scrollToSection('fresh-eggs')}
                className="hover:text-[#22C55E] transition-colors duration-300 cursor-pointer"
              >
                About Fresh Eggs
              </button>
            </li>
            <li>What To Expect From Your Eggs</li>
            <li>
              <button 
                onClick={() => scrollToSection('our-birds')}
                className="hover:text-[#22C55E] transition-colors duration-300 cursor-pointer"
              >
                Birds, Birds, Birds!
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('our-farm')}
                className="hover:text-[#22C55E] transition-colors duration-300 cursor-pointer"
              >
                Our Farm, Kevinsgate
              </button>
            </li>
          </ul>
        </motion.div>
      </section>

      {/* About Fresh Eggs Section */}
      <section id="fresh-eggs" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6">About Fresh Eggs</h2>
          <div className="prose prose-lg max-w-none text-gray-200">
            <p>The eggs you received are unwashed and counter-kept, but</p>
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">WHAT DOES THAT MEAN????</h3>
            <p>When a hen lays an egg, it is naturally coated with a protective layer called the "bloom". This invisible coating helps seal the eggshell's porous surface, preventing bacteria and moisture from entering the egg and keeping it fresh for longer.</p>
            <br />
            <p>In the U.S., commercially sold eggs are washed to meet regulatory standards, which removes the bloom. This process requires refrigeration to prevent contamination. However, with unwashed farm-fresh eggs, the bloom remains intact, allowing the eggs to stay safely at room temperature for a minimum of two weeks or more.</p>
            <br />
            <p>If refrigeration is required later, unwashed eggs can be chilled, though once refrigerated, they should stay cold to prevent condensation and bacterial growth.</p>
            <br />
            <p>Farm fresh unwashed eggs, when stored on the counter, can typically last a minimum of 2 to 3 weeks. For longer storage, refrigeration is recommended, and in that case, unwashed eggs can last for several months or more.</p>
            <h3 
              onClick={() => scrollToSection('contact-form')} 
              className="text-2xl font-bold text-white mt-8 mb-4 group flex items-center gap-2 w-fit"
            >
              Need eggs? Contact me!
              <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </h3>
            <p>I travel to the Springfield, Arlington, and Alexandria area every other week. Bring back your empty egg cartons for 50 cents off per dozen! All donations go toward helping feed our girls!</p>
          </div>
          <div className="mt-8">
            <ImageCarousel media={freshEggsMedia} height="600px" objectFit="cover" />
          </div>
        </motion.div>
      </section>

      {/* About Our Birds Section */}
      <section id="our-birds" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6">About Our Birds</h2>
          <div className="prose prose-lg max-w-none text-gray-200">
            <p>At our farm, we take great pride in raising free-range birds that are not only well cared for but also truly loved. Our diverse flock, which includes chickens, ducks, guinea fowl, quail, turkeys, and geese, thrives in an environment that celebrates their natural behaviors and instincts. They are free to roam in a large protected area, enjoying fresh air and sunshine as they forage, dust bathe, snack on fresh vegetation and bugs and take dips in one of their 3 pools. Their daily diet consists of 50 pounds of chicken feed supplemented by over 10 gallons of fresh fruits and vegetables, ensuring their health and vitality. While they are not considered 'organic' their diet is fresh, healthy, and varied, and they are never treated with hormones, steroids, or any other drugs or medications.</p>
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">We have many varieties of birds on our farm:</h3>
            <p>For chickens, we have:</p>
            <br></br>
            <p>Rhode Island Red, Leghorn, Barred Plymouth Rock, Sussex, Wyandotte, Australorp, Orpington, Ameraucana, Brahma, Ancona, Welsummer, Jersey Giants, Legbars, and we have just added French Bresse birds this year as a dual purpose bird.</p>
          </div>
          <div className="mt-8">
            <ImageCarousel media={birdsMedia} height="600px" objectFit="cover" />
          </div>
        </motion.div>
      </section>

      {/* About Our Farm Section */}
      <section id="our-farm" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-12 card-hover
                   border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6">About Our Farm</h2>
          <div className="prose prose-lg max-w-none text-gray-200">
            <p>In 2020, we embarked on a new chapter in Culpeper, searching for a piece of green where our family of eight could settle and grow. What started as a simple dream soon turned into a memorable adventure—leaving Tractor Supply with four chirping chicks tucked in a red-and-white cardboard box, carefully perched on the knees of four excited kids in the back seat.</p>
            <br />
            <p>Today, our flock has blossomed into a diverse, bustling community of over 100 birds. From their charming antics to the nourishment and joy they bring, these feathered companions have enriched our lives in countless ways. They've taught us invaluable lessons—about loving and losing, commitment, and making tough decisions when needed.</p>
            <br />
            <p>For us, the farm is more than a place for production. It's a sanctuary—a space where our birds thrive under our care and affection. Each one is given the freedom, nourishment, and love they deserve, and in return, they remind us daily of the rewards of living in harmony with nature. Our commitment to ethical farming practices stems from this belief: happy, healthy animals create a farm that is full of life and meaning.</p>
          </div>
          <div className="mt-8">
            <ImageCarousel media={farmMedia} height="600px" objectFit="cover" />
          </div>
        </motion.div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form">
        <ContactForm 
          description="Want to learn more about our farm-fresh eggs or schedule a pickup? We'd love to hear from you!"
          padding="py-12"
        />
      </section>
    </div>
  );
}