import React from 'react';
import { motion } from 'framer-motion';
import { ImageCarousel } from '../components/ImageCarousel';
import { ContactForm } from '../components/ContactForm';
import { ChevronRight } from 'lucide-react';

// You'll need to add your image arrays here for each section
const freshEggsMedia = [
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/egg_collection.jpg", // Mix of eggs in containers
    alt: "Ducking Gravity fresh farm eggs in egg carton."
  },
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/eggs_in_wild.jpg", // Eggs in the wild
    alt: "Ducking Gravity fresh farm eggs from the wild."
  }
];

const birdsMedia = [
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/chicken_posing_as_rabbit_statue.jpg", // Rhode Island Red
    alt: "One of Ducking Gravity's signature ducks doing her job trying to lay an egg."
  },
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/chickens_on_deck.jpeg", // Rhode Island Red
    alt: "One of Ducking Gravity's signature ducks doing her job trying to lay an egg."
  }
];

const farmMedia = [
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/bird_collection.jpg", // Free range chickens
    alt: "Ducking Gravity's chickens free-ranging in the yard."
  },
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/bird_sitting_on_eggs.jpg", // Rhode Island Red
    alt: "One of Ducking Gravity's signature ducks doing her job trying to lay an egg."
  },
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/chicken_with_ducks.jpg", // Rhode Island Red
    alt: "One of Ducking Gravity's high class mamas doing her job trying to raise a very diverse flock."
  },
  {
    url: "https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/picturesque_farm_view_with_chickens.jpg", // Rhode Island Red
    alt: "Picturesque view of the farm with the silks hanging from the laundry line guest staring some Ducking Gravity chickens."
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
    <div className="min-h-screen bg-[#0378C2]">
      {/* Hero Section with Page Links */}
      <section className="container mx-auto px-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl font-['Amatic_SC'] text-white mb-8 uppercase tracking-wider">
            Our Hobby Farm!
          </h1>
          <ul className="text-xl text-gray-200 max-w-3xl mx-auto font-light space-y-4">
            <li>
              <button 
                onClick={() => scrollToSection('fresh-eggs')}
                className="text-lg font-semibold bg-[#22C55E] text-white px-8 py-3 rounded-lg hover:bg-[#16A34A] transition-colors duration-300 group flex items-center gap-2 w-fit mx-auto cursor-pointer shadow-lg"
              >
                About Fresh Eggs 🥚
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('our-birds')}
                className="text-lg font-semibold bg-[#22C55E] text-white px-8 py-3 rounded-lg hover:bg-[#16A34A] transition-colors duration-300 group flex items-center gap-2 w-fit mx-auto cursor-pointer shadow-lg"
              >
                What To Expect From Your Eggs ❓
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </button>
            </li>
            {/* <li>
              <button 
                onClick={() => scrollToSection('chicken-varieties')}
                className="hover:text-[#22C55E] transition-colors duration-300 cursor-pointer"
              >
                Birds, Birds, Birds!
              </button>
            </li> */}
            <li>
              <button 
                onClick={() => scrollToSection('our-farm')}
                className="text-lg font-semibold bg-[#22C55E] text-white px-8 py-3 rounded-lg hover:bg-[#16A34A] transition-colors duration-300 group flex items-center gap-2 w-fit mx-auto cursor-pointer shadow-lg"
              >
                Our Farm, Kevinsgate 🏠
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
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
          className="bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
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
              className="text-lg font-semibold bg-[#22C55E] text-white px-8 py-3 rounded-lg hover:bg-[#16A34A] transition-colors duration-300 mt-8 mb-4 group flex items-center gap-2 w-fit cursor-pointer shadow-lg"
            >
              Need eggs? Contact me! ✉
              <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </h3>
            <p>I travel to the Springfield, Arlington, and Alexandria area every other week. Bring back your empty egg cartons for 50 cents off per dozen! All donations go toward helping feed our girls!</p>
          </div>
          <div className="mt-8">
            <ImageCarousel 
              media={freshEggsMedia} 
              height="800px"
              objectFit="contain"
            />
          </div>
          </motion.div>
      </section>

      {/* About Our Birds Section */}
      <section id="our-birds" className="container mx-auto px-4 py-20">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
        >
          <h2 className="text-3xl font-bold text-white mb-6">About Our Birds</h2>
          <div className="prose prose-lg max-w-none text-gray-200">
            <p>At our farm, we take great pride in raising free-range birds that are not only well cared for but also truly loved. Our diverse flock, which includes chickens, ducks, guinea fowl, quail, turkeys, and geese, thrives in an environment that celebrates their natural behaviors and instincts. They are free to roam in a large protected area, enjoying fresh air and sunshine as they forage, dust bathe, snack on fresh vegetation and bugs and take dips in one of their 3 pools. Their daily diet consists of 50 pounds of chicken feed supplemented by over 10 gallons of fresh fruits and vegetables, ensuring their health and vitality. While they are not considered 'organic' their diet is fresh, healthy, and varied, and they are never treated with hormones, steroids, or any other drugs or medications.</p>
            <h3 className="text-2xl font-bold text-white mt-8 mb-4">We have many varieties of birds on our farm:</h3>
            <p id="chicken-varieties">For chickens, we have:</p>
            <br></br>
            <p>Rhode Island Red, Leghorn, Barred Plymouth Rock, Sussex, Wyandotte, Australorp, Orpington, Ameraucana, Brahma, Ancona, Welsummer, Jersey Giants, Legbars, and we have just added French Bresse birds this year as a dual purpose bird.</p>
          </div>
          <div className="mt-8">
            <ImageCarousel 
              media={birdsMedia} 
              height="800px"
              objectFit="contain"
            />
          </div>
          </motion.div>
      </section>

      {/* About Our Farm Section */}
      <section id="our-farm" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-filter backdrop-blur-md rounded-lg p-12 card-hover
                   border border-[#42A5F5] shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
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
            <ImageCarousel 
              media={farmMedia} 
              height="800px"
              objectFit="contain"
            />
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