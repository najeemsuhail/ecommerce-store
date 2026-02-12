'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface CategoryCarouselProps {
  categories: string[];
}

const categoryIcons: { [key: number]: string } = {
  0: '💻',
  1: '👕',
  2: '📱',
  3: '🏠',
  4: '⚽',
  5: '📚',
  6: '👗',
  7: '🎮',
  8: '🎵',
  9: '🍕',
};

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);

  // Update items per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(2);
      else if (window.innerWidth < 768) setItemsPerView(3);
      else if (window.innerWidth < 1024) setItemsPerView(4);
      else setItemsPerView(6);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, categories.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (categories.length === 0) return; // Guard inside the hook
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [maxIndex, categories.length]);

  // Early return AFTER all hooks
  if (categories.length === 0) return null;

  const visibleCategories = categories.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <section className="py-16 bg-gradient-to-b from-white via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Shop by Category
              </span>
            </h2>
            <p className="text-lg text-gray-600">Explore our wide range of products</p>
          </div>

          {/* Navigation Buttons */}
          {categories.length > itemsPerView && (
            <div className="hidden sm:flex gap-3">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                aria-label="Previous categories"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                aria-label="Next categories"
              >
                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Items */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {categories.map((category, index) => (
                <Link
                  key={`${category}-${index}`}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="flex-shrink-0 w-full transition-all duration-300"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="group relative bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-blue-500 h-full flex flex-col items-center justify-center min-h-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300"></div>
                    <div className="relative text-center">
                      <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {categoryIcons[index] || '📦'}
                      </div>
                      <h3 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {category}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Indicators */}
          {categories.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(categories.length / itemsPerView) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      Math.floor(currentIndex / 1) === index
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation Info */}
        {categories.length > itemsPerView && (
          <div className="text-center mt-6 text-sm text-gray-500 sm:hidden">
            Swipe to explore more categories
          </div>
        )}
      </div>
    </section>
  );
}
