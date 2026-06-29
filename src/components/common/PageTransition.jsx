/**
 * @file src/components/common/PageTransition.jsx
 * @description Wrapper component for global page transitions using Framer Motion.
 * Applies a cinematic Cross-Fade & Scale transition (Netflix style).
 */

import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export default function PageTransition({ children, className }) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      // Ensure the page takes at least full viewport height to avoid background flashing
      style={{ minHeight: '100dvh', width: '100%', overflowX: 'hidden' }}
    >
      {children}
    </motion.main>
  );
}
