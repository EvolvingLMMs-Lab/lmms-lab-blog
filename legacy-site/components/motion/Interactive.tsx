'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { linkVariants } from './variants';

interface InteractiveProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export default function Interactive({ children, className, ...props }: InteractiveProps) {
  return (
    <motion.button
      variants={linkVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
