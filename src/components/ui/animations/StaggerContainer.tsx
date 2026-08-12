'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  once?: boolean;
}

const containerVariants = (staggerDelay: number, delayChildren: number) => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren,
      staggerChildren: staggerDelay,
    },
  },
});

export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function StaggerContainer({
  children,
  staggerDelay = 0.07,
  delayChildren = 0.04,
  className = '',
  once = true,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-20px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={itemVariants} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </motion.div>
  );
}
