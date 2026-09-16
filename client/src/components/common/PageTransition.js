import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

export default function PageTransition({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  return <motion.div key={location.pathname} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
