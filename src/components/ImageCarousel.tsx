import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  url: string;
  alt: string;
  type: 'image' | 'video';
  thumbnail?: string; // Optional thumbnail for videos
}

interface ImageCarouselProps {
  media: MediaItem[];
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function ImageCarousel({ 
  media, 
  height = '600px',
  objectFit = 'contain'
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const renderMediaItem = (item: MediaItem) => {
    if (item.type === 'video') {
      return (
        <video
          key={currentIndex}
          src={item.url}
          controls
          className={`absolute w-full h-full object-${objectFit}`}
          poster={item.thumbnail}
        >
          <source src={item.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <motion.img
        key={currentIndex}
        src={item.url}
        alt={item.alt}
        className={`absolute w-full h-full object-${objectFit}`}
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        transition={{ duration: 0.5 }}
      />
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ height }}>
      <AnimatePresence initial={false}>
        {renderMediaItem(media[currentIndex])}
      </AnimatePresence>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {media.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}