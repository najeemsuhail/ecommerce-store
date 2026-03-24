'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

export default function HeroCarousel() {
  const { heroSlides } = useStoreSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = currentSlide < heroSlides.length ? currentSlide : 0;

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides]);

  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? 'pointer-events-auto z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
            }`}
          >
            <div className="absolute inset-0">
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            <div className="relative mx-auto flex h-[320px] max-w-7xl items-center px-4 py-6 sm:h-[380px] sm:py-8 md:h-[420px] md:py-12 lg:h-[520px] lg:py-16">
              <div className="w-full space-y-4 text-center sm:space-y-5 md:space-y-6">
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-2xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                    <span className="block text-white drop-shadow-2xl">{slide.mainHeading}</span>
                    <span className="block text-3xl font-black text-white drop-shadow-2xl sm:text-5xl md:text-6xl">
                      {slide.subHeading}
                    </span>
                  </h1>
                </div>

                <p className="mx-auto max-w-xl text-[11px] leading-relaxed text-gray-200 drop-shadow-lg sm:text-sm md:max-w-2xl md:text-base">
                  {slide.description}
                </p>

                <div className="flex justify-center pt-1 sm:pt-3">
                  <Link
                    href={slide.primaryCTA.href}
                    className="group relative flex w-full max-w-[220px] items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 sm:w-auto sm:max-w-none sm:px-6 sm:py-2"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                    <span className="relative">{slide.primaryCTA.label}</span>
                    <svg
                      className="relative h-3 w-3 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="h-[320px] sm:h-[380px] md:h-[420px] lg:h-[520px]"></div>

        {heroSlides.length > 1 && (
          <div className="hidden gap-3 md:absolute md:bottom-4 md:left-1/2 md:z-20 md:flex md:-translate-x-1/2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === activeSlide ? 'h-3 w-8 bg-white' : 'h-3 w-3 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
