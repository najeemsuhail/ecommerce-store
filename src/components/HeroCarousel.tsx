'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface HeroSlide {
  id: number;
  badge: string;
  badgeEmoji: string;
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
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    badge: 'New Arrivals Available',
    badgeEmoji: '✨',
    mainHeading: 'Discover the Trend',
    subHeading: 'That Fits You',
    description: 'Explore curated collections of premium products with exclusive deals and fast delivery.',
    primaryCTA: { label: 'Shop Now', href: '/products' },
    secondaryCTA: { label: '✨ Featured', href: '/products?isFeatured=true' },
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    accentColor: 'from-blue-400 via-purple-400 to-pink-400',
  },
  {
    id: 2,
    badge: 'Limited Time Offer',
    badgeEmoji: '🎉',
    mainHeading: 'Exclusive Deals',
    subHeading: 'Up to 50% Off',
    description: 'Shop the biggest sale of the season with unbeatable prices on your favorite items.',
    primaryCTA: { label: 'Shop Sale', href: '/products?sort=newest' },
    secondaryCTA: { label: '🎁 Gift Cards', href: '/products' },
    gradient: 'from-red-900 via-orange-900 to-red-900',
    accentColor: 'from-yellow-400 via-red-400 to-orange-400',
  },
  {
    id: 3,
    badge: 'Free Shipping Worldwide',
    badgeEmoji: '🚚',
    mainHeading: 'Shop Freely',
    subHeading: 'Worldwide Delivery',
    description: 'Get your favorite products delivered anywhere in the world with free shipping on all orders.',
    primaryCTA: { label: 'Start Shopping', href: '/products' },
    secondaryCTA: { label: '📍 Track Order', href: '/dashboard' },
    gradient: 'from-green-900 via-emerald-900 to-green-900',
    accentColor: 'from-green-400 via-cyan-400 to-blue-400',
  },
  {
    id: 4,
    badge: 'Member Exclusive',
    badgeEmoji: '👑',
    mainHeading: 'Premium Quality',
    subHeading: 'Best Value Products',
    description: 'Join our membership program and enjoy premium benefits, exclusive access, and rewards.',
    primaryCTA: { label: 'Join Now', href: '/auth' },
    secondaryCTA: { label: '💎 VIP Benefits', href: '/products' },
    gradient: 'from-indigo-900 via-purple-900 to-indigo-900',
    accentColor: 'from-indigo-400 via-purple-400 to-pink-400',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden">
      {/* Carousel Container */}
      <div className="relative">
        {/* Slides */}
        {heroSlides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`}>
              {/* Animated gradient orbs */}
              <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

              {/* Grid background pattern */}
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-size-20"></div>
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 min-h-fit pb-32 md:pb-16">
              <div className="text-center space-y-6">
                {/* Badge */}
                {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group">
                  <span className="text-xl">{s.badgeEmoji}</span>
                  <span className="text-sm font-semibold">{s.badge}</span>
                  <span className="ml-1 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </div> */}

                {/* Main heading */}
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="block text-white drop-shadow-2xl">{s.mainHeading}</span>
                    <span
                      className={`block bg-gradient-to-r ${s.accentColor} bg-clip-text text-transparent drop-shadow-lg text-4xl md:text-6xl font-black`}
                    >
                      {s.subHeading}
                    </span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-xs md:text-base text-gray-200 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
                  {s.description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center pt-3">
                  <Link
                    href={s.primaryCTA.href}
                    className="group relative px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xs md:text-sm rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden whitespace-nowrap"
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
        <div className="h-auto md:h-96 min-h-80"></div>

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
