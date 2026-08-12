// src/components/auth/BrandPanel.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BarChart2, CalendarDays, FileText, ShieldCheck, Receipt } from 'lucide-react';

const features = [
  { icon: BarChart2, label: 'Data Analytics' },
  { icon: CalendarDays, label: 'Online Scheduling' },
  { icon: FileText, label: 'Resulting' },
  { icon: ShieldCheck, label: 'Document Surveillance' },
  { icon: Receipt, label: 'Invoicing' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center md:justify-between items-center md:items-start text-center md:text-left bg-linear-to-br from-primary to-[#30836B] p-8 md:p-10 min-h-[220px] md:min-h-[520px] overflow-hidden">
      {/* Animated Dot-grid decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-6 left-8 hidden md:block pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          width: 160,
          height: 120,
        }}
      />

      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center gap-3 md:gap-4"
      >
        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:bg-white/30">
          <Image
            src="/images/logo/logo.png"
            alt="E-Document Portal Logo"
            fill
            priority
            className="object-contain p-1.5 md:p-2"
            sizes="(max-width: 768px) 40px, 56px"
          />
        </div>
        <span className="text-white font-bold text-lg md:text-xl tracking-widest uppercase drop-shadow-sm">
          E-Document
        </span>
      </motion.div>

      {/* Hero text + feature list */}
      <div className="relative z-10 mt-4 md:mt-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-bold text-2xl md:text-4xl leading-tight tracking-tight drop-shadow-sm"
        >
          Document<span className="hidden md:inline"><br /></span><span className="inline md:hidden"> </span>
          Management<span className="hidden md:inline"><br /></span><span className="inline md:hidden"> </span>
          Portal
        </motion.h1>

        {/* Feature list with staggered animation */}
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden md:flex flex-col gap-4 mt-10"
        >
          {features.map(({ icon: Icon, label }) => (
            <motion.li
              key={label}
              variants={itemVariants}
              className="flex items-center gap-3 group cursor-default"
            >
              <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25 group-hover:shadow-lg">
                <Icon size={17} className="text-white/90" />
              </span>
              <span className="text-white/90 text-[15px] font-medium tracking-wide transition-colors group-hover:text-white">
                {label}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Animated Circle decorations */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-40px] right-[-40px] w-40 h-40 md:w-56 md:h-56 rounded-full border-20 md:border-32 border-white/10 pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-[-80px] right-[-80px] w-56 h-56 md:w-72 md:h-72 rounded-full border-16 md:border-24 border-white/5 pointer-events-none"
      />
    </div>
  );
}