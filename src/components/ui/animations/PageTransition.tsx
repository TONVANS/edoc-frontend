'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Silky smooth easeOutCubic curve
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedMotionVariants : pageVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className={`w-full min-h-full ${className}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
