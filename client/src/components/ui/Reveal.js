import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function Reveal({ as: Component = 'div', className = '', children, delay = 0, ...props }) {
  const reduceMotion = useReducedMotion();
  const MotionComponent = motion.create(Component);
  return <MotionComponent className={className} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }} {...props}>{children}</MotionComponent>;
}
