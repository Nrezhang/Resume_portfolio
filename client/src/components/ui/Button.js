import React from 'react';
import { motion } from 'motion/react';

const variants = {
  default: 'button-dark',
  secondary: 'button-light',
  accent: 'button-accent',
  inverse: 'button-inverse',
  ghost: 'button-ghost',
};

export default function Button({ asChild = false, variant = 'default', className = '', children, ...props }) {
  const classes = ['button', variants[variant], className].filter(Boolean).join(' ');

  if (asChild && React.isValidElement(children)) {
    const MotionChild = motion.create(children.type);
    return <MotionChild
      {...children.props}
      {...props}
      className={[classes, children.props.className].filter(Boolean).join(' ')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    />;
  }

  return <motion.button className={classes} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} {...props}>{children}</motion.button>;
}
