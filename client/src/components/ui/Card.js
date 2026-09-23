import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function Card({ as: Component = 'article', className = '', children, index = 0, ...props }) {
  const reduceMotion = useReducedMotion();
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);
  return <MotionComponent className={className} initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28), ease: [0.22, 1, 0.36, 1] }} {...props}>{children}</MotionComponent>;
}
