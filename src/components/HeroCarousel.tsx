import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
import { HeroSlide } from '../types';

interface HeroCarouselProps {
  slides: HeroSlide[];
  intervalMs?: number;
  onNavigate: (view: string, param?: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  intervalMs = 3500,
  onNavigate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Smooth progress bar and slide advancement every 3.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    startTimeRef.current = Date.now();
    setProgress(0);

    const updateTimer = () => {
      if (isPaused) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(100, (elapsed / intervalMs) * 100);
      setProgress(currentProgress);

      if (elapsed >= intervalMs) {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        startTimeRef.current = Date.now();
        setProgress(0);
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentIndex, isPaused, slides.length, intervalMs]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  const handleCtaClick = (link: string) => {
    if (link.startsWith('/shop')) {
      const url = new URL(link, 'http://localhost');
      const silhouette = url.searchParams.get('silhouette');
      const collection = url.searchParams.get('collection');
      if (silhouette) {
        onNavigate('shop', silhouette);
      } else if (collection) {
        onNavigate('shop', collection);
      } else {
        onNavigate('shop');
      }
    } else if (link.startsWith('/product/')) {
      const slug = link.replace('/product/', '');
      onNavigate('product', slug);
    } else if (link.startsWith('/collections')) {
      onNavigate('collections');
    } else if (link.startsWith('/about') || link.startsWith('/story')) {
      onNavigate('story');
    } else {
      onNavigate('shop');
    }
  };

  return (
    <section 
      className="relative w-full h-[88vh] sm:h-[92vh] min-h-[640px] max-h-[960px] bg-[#49332D] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      aria-label="Campaign Hero Carousel"
    >
      {/* Background Slides: Only One Dominant Handbag Image Visible At A Time */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background image with cinematic slow pan/zoom */}
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover object-center transform transition-transform duration-6000 ease-out ${
              idx === currentIndex ? 'scale-104' : 'scale-100'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />

          {/* Vignette & Soft Editorial Gradients for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#49332D]/95 via-[#49332D]/40 to-black/20" />
          <div className="absolute inset-0 bg-[#49332D]/25 mix-blend-multiply" />
        </div>
      ))}

      {/* Hero Content Overlay: Asymmetrical Editorial Composition */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-20 lg:pb-24">
        
        <div className="max-w-2xl text-[#F7F3ED] space-y-4 sm:space-y-6">
          
          {/* Eyebrow with decorative gold hairline */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-[#B49A72]" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#B49A72] font-semibold">
              {currentSlide.eyebrow}
            </span>
            <span className="text-white/40 text-[10px]">·</span>
            <span className="text-white/60 text-[10px] tracking-wider uppercase">
              Edition {currentIndex + 1} of {slides.length}
            </span>
          </div>

          {/* High-Contrast Editorial Headline */}
          <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight font-light drop-shadow-xs">
            {currentSlide.title}
          </h1>

          {/* Evocative Subtitle */}
          <p className="text-xs sm:text-base text-[#F7F3ED]/90 max-w-lg font-light leading-relaxed">
            {currentSlide.subtitle}
          </p>

          {/* Action CTAs: Primary Satin Champagne + Secondary Minimalist Border */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => handleCtaClick(currentSlide.ctaLink)}
              className="bg-[#B49A72] text-[#49332D] hover:bg-white hover:text-[#49332D] text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-8 transition-all duration-300 flex items-center gap-2 group cursor-pointer shadow-sm"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {currentSlide.secondaryCtaText && (
              <button
                onClick={() => handleCtaClick(currentSlide.secondaryCtaLink || '/collections')}
                className="bg-transparent border border-[#F7F3ED]/40 text-[#F7F3ED] hover:bg-[#F7F3ED]/15 text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-6 transition-all duration-300 cursor-pointer"
              >
                {currentSlide.secondaryCtaText}
              </button>
            )}
          </div>

          {/* Atelier Pull Quote */}
          {currentSlide.accentQuote && (
            <p className="text-xs text-[#B49A72]/90 italic font-serif-editorial pt-2 hidden sm:block">
              “{currentSlide.accentQuote}”
            </p>
          )}

        </div>

        {/* Carousel Navigation Indicators & Controls: Unobtrusive Line Timer & Numbered Indicators */}
        <div className="absolute right-6 sm:right-12 bottom-12 sm:bottom-16 flex flex-col sm:flex-row items-end sm:items-center gap-4">
          
          {/* Pause / Play status indicator */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 text-white/50 hover:text-white transition-colors text-xs flex items-center gap-1.5"
            title={isPaused ? 'Resume auto-carousel' : 'Pause carousel'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-[#B49A72]" /> : <Pause className="w-3.5 h-3.5 text-[#B49A72]" />}
            <span className="text-[10px] uppercase tracking-wider hidden sm:inline">
              {isPaused ? 'Paused' : '3.5s Flow'}
            </span>
          </button>

          {/* Numbered Indicators with Live Progress Fill Line */}
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelectSlide(i)}
                aria-label={`Jump to slide ${i + 1}`}
                className="group flex flex-col items-center gap-1 cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[11px] font-mono transition-colors ${
                    currentIndex === i ? 'text-[#B49A72] font-bold' : 'text-white/40 group-hover:text-white/70'
                  }`}>
                    0{i + 1}
                  </span>
                </div>

                {/* Progress bar container */}
                <div className="w-10 sm:w-14 h-[2px] bg-white/20 overflow-hidden relative">
                  {currentIndex === i ? (
                    <div 
                      className="h-full bg-[#B49A72] transition-none"
                      style={{ width: `${progress}%` }}
                    />
                  ) : (
                    <div className="h-full w-0 bg-white/40" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Manual Arrow Controls */}
          <div className="flex items-center gap-1 border-l border-white/20 pl-3">
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="p-2 text-[#F7F3ED]/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="p-2 text-[#F7F3ED]/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
