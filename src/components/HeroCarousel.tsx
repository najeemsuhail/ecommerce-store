'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeroSlide {
  id: number;
  badge: string;
  badgeEmoji: string;
  category: string;
  mainHeading: string;
  subHeading: string;
  description: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA: {
    label: string;
    href: string;
  };
  gradient: string;
  accentColor: string;
  image: {
    src: string;
    alt: string;
  };
}

const buildCategoryHref = (category: string) => `/products?category=${encodeURIComponent(category)}`;

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    badge: 'Kitchen Essentials',
    badgeEmoji: '🍳',
    category: 'Kitchen',
    mainHeading: 'Smart Cooking',
    subHeading: 'Starts Here',
    description: 'Cook faster and cleaner with modern kitchen tools and storage solutions.',
    primaryCTA: { label: 'Shop Kitchen', href: buildCategoryHref('Kitchen') },
    secondaryCTA: { label: 'View All', href: buildCategoryHref('Kitchen') },
    gradient: 'from-orange-900 via-amber-800 to-orange-900',
    accentColor: 'from-yellow-400 via-amber-400 to-orange-400',
    image: {
      src: 'https://hcdbneuopujhkuoulqlc.supabase.co/storage/v1/object/sign/kani-store/hero-banner/hero-kitchen.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZmJhNGQyMC0zMTBjLTQyYjItOWEzMi1kNWJhNzliZjNhYzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJrYW5pLXN0b3JlL2hlcm8tYmFubmVyL2hlcm8ta2l0Y2hlbi5wbmciLCJpYXQiOjE3NzM4MTkzMjYsImV4cCI6MTgwNTM1NTMyNn0.xjtGzeTdveOTjb6yPflzz-bIjieC2iBLCvKqm_ssk6w', // 👈 use generated image
      alt: 'Kitchen essentials setup',
    },
  },
  {
    id: 2,
    badge: 'Cleaning Essentials',
    badgeEmoji: '🧹',
    category: 'Cleaning',
    mainHeading: 'Clean Home',
    subHeading: 'Happy Life',
    description: 'Keep your home fresh with efficient cleaning tools and supplies.',
    primaryCTA: { label: 'Shop Cleaning', href: buildCategoryHref('Cleaning') },
    secondaryCTA: { label: 'Browse', href: buildCategoryHref('Cleaning') },
    gradient: 'from-blue-900 via-cyan-800 to-blue-900',
    accentColor: 'from-cyan-400 via-blue-400 to-indigo-400',
    image: {
      src: 'https://hcdbneuopujhkuoulqlc.supabase.co/storage/v1/object/sign/kani-store/hero-banner/hero-cleaning.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZmJhNGQyMC0zMTBjLTQyYjItOWEzMi1kNWJhNzliZjNhYzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJrYW5pLXN0b3JlL2hlcm8tYmFubmVyL2hlcm8tY2xlYW5pbmcucG5nIiwiaWF0IjoxNzczODE5MzYwLCJleHAiOjE4MDUzNTUzNjB9.9eHlQW8j9qZ5qAEutOgY2dZjSuV1OwPwnb2IWObURWg',
      alt: 'Cleaning products setup',
    },
  },
  {
    id: 3,
    badge: 'Home Storage',
    badgeEmoji: '🧺',
    category: 'Storage',
    mainHeading: 'Organize Your',
    subHeading: 'Space Better',
    description: 'Declutter your home with smart storage and organization solutions.',
    primaryCTA: { label: 'Shop Storage', href: buildCategoryHref('Storage') },
    secondaryCTA: { label: 'Explore', href: buildCategoryHref('Storage') },
    gradient: 'from-emerald-900 via-teal-800 to-emerald-900',
    accentColor: 'from-emerald-400 via-teal-400 to-cyan-400',
    image: {
      src: 'https://hcdbneuopujhkuoulqlc.supabase.co/storage/v1/object/sign/kani-store/hero-banner/hero-storage.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZmJhNGQyMC0zMTBjLTQyYjItOWEzMi1kNWJhNzliZjNhYzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJrYW5pLXN0b3JlL2hlcm8tYmFubmVyL2hlcm8tc3RvcmFnZS5wbmciLCJpYXQiOjE3NzM4MTkzMTQsImV4cCI6MTgwNTM1NTMxNH0.g6KFYoIG68at3tUJaHEeaCErvelyH1xChKZECcnxmdk',
      alt: 'Storage boxes and organizers',
    },
  },
  {
    id: 4,
    badge: 'Home Decor',
    badgeEmoji: '🪴',
    category: 'Home Decor',
    mainHeading: 'Make Your Home',
    subHeading: 'Beautiful',
    description: 'Stylish decor pieces to enhance your living space effortlessly.',
    primaryCTA: { label: 'Shop Decor', href: buildCategoryHref('Home Decor') },
    secondaryCTA: { label: 'View Items', href: buildCategoryHref('Home Decor') },
    gradient: 'from-purple-900 via-pink-800 to-purple-900',
    accentColor: 'from-pink-400 via-purple-400 to-indigo-400',
    image: {
      src: 'https://hcdbneuopujhkuoulqlc.supabase.co/storage/v1/object/sign/kani-store/hero-banner/hero-home-decor.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZmJhNGQyMC0zMTBjLTQyYjItOWEzMi1kNWJhNzliZjNhYzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJrYW5pLXN0b3JlL2hlcm8tYmFubmVyL2hlcm8taG9tZS1kZWNvci5wbmciLCJpYXQiOjE3NzM4MTkzNDUsImV4cCI6MTgwNTM1NTM0NX0.wcuwsllwcusOU8vZqwu9VJWIG6uQt1ewLrhrmFgFp90',
      alt: 'Home decor setup',
    },
  },
];


export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Carousel Container */}
      <div className="relative">
        {/* Slides */}
        {heroSlides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'pointer-events-auto opacity-100 z-10' : 'pointer-events-none opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0">
              <Image
                src={s.image.src}
                alt={s.image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            {/* Content */}
            <div className="relative mx-auto flex h-[320px] max-w-7xl items-center px-4 py-6 sm:h-[380px] sm:py-8 md:h-[420px] md:py-12 lg:h-[520px] lg:py-16">
              <div className="w-full text-center space-y-4 sm:space-y-5 md:space-y-6">
                {/* Badge */}
                {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group">
                  <span className="text-xl">{s.badgeEmoji}</span>
                  <span className="text-sm font-semibold">{s.badge}</span>
                  <span className="ml-1 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </div> */}

                {/* Main heading */}
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="block text-white drop-shadow-2xl">{s.mainHeading}</span>
                    <span className="block text-white drop-shadow-2xl text-3xl sm:text-5xl md:text-6xl font-black">
                      {s.subHeading}
                    </span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="mx-auto max-w-xl text-[11px] leading-relaxed text-gray-200 drop-shadow-lg sm:text-sm md:max-w-2xl md:text-base">
                  {s.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex justify-center pt-1 sm:pt-3">
                  <Link
                    href={s.primaryCTA.href}
                    className="group relative flex w-full max-w-[220px] items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 sm:w-auto sm:max-w-none sm:px-6 sm:py-2"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative">{s.primaryCTA.label}</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>

                  {/* Secondary CTA - Commented Out */}
                  {/* <Link
                    href={s.secondaryCTA.href}
                    className="group px-4 py-2 md:px-6 md:py-2 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-xs md:text-sm rounded-full hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{s.secondaryCTA.label}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link> */}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Height placeholder - auto-height based on content */}
        <div className="h-[320px] sm:h-[380px] md:h-[420px] lg:h-[520px]"></div>

        {/* Indicators/Dots */}
        <div className="hidden md:absolute md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:z-20 md:flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'bg-white w-8 h-3'
                  : 'bg-white/50 hover:bg-white/70 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Autoplay Toggle */}
        </div>
      </section>
    );
  }
