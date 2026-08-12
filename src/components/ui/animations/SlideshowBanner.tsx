'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export interface SlideItem {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeBg?: string;
  bgGradient?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  content?: React.ReactNode;
}

interface SlideshowBannerProps {
  slides: SlideItem[];
  autoPlayInterval?: number; // ms
  className?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
    },
  }),
};

export default function SlideshowBanner({
  slides,
  autoPlayInterval = 5000,
  className = '',
}: SlideshowBannerProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const activeIndex = Math.abs(page % slides.length);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  const goToSlide = (index: number) => {
    const newDir = index > activeIndex ? 1 : -1;
    setPage([index, newDir]);
  };

  useEffect(() => {
    if (!isPlaying || isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, slides.length, autoPlayInterval, paginate]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[activeIndex];

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-sm border border-white/60 bg-white/40 backdrop-blur-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative min-h-35 sm:min-h-40 flex items-center p-5 sm:p-6 md:p-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000 || offset.x < -80) {
                paginate(1);
              } else if (swipe > 10000 || offset.x > 80) {
                paginate(-1);
              }
            }}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none"
          >
            {currentSlide.content ? (
              currentSlide.content
            ) : (
              <>
                <div className="flex items-start gap-4 max-w-2xl">
                  {currentSlide.icon && (
                    <div className="w-12 h-12 rounded-2xl bg-[#185C4D]/10 text-[#185C4D] flex items-center justify-center shrink-0 shadow-inner">
                      {currentSlide.icon}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {currentSlide.badge && (
                      <span
                        className={`inline-block self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          currentSlide.badgeBg || 'bg-[#185C4D]/15 text-[#185C4D]'
                        }`}
                      >
                        {currentSlide.badge}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-[#1C1C1E] tracking-tight">
                      {currentSlide.title}
                    </h3>
                    {currentSlide.subtitle && (
                      <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {currentSlide.onAction && currentSlide.actionText && (
                  <button
                    onClick={currentSlide.onAction}
                    className="cursor-pointer font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl bg-[#185C4D] text-white hover:bg-[#124539] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#185C4D]/20 self-end sm:self-center"
                  >
                    {currentSlide.actionText}
                  </button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls & Pagination Indicators */}
      {slides.length > 1 && (
        <div className="px-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === activeIndex
                    ? 'w-6 bg-[#185C4D]'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next slide"
              className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
