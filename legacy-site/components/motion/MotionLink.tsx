'use client';

import Link, { LinkProps } from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode, ComponentProps } from 'react';
import { linkVariants } from './variants';

type MotionLinkProps = LinkProps & ComponentProps<'a'> & {
  children: ReactNode;
  className?: string;
  href: string;
  style?: React.CSSProperties;
}

export default function MotionLink({ children, className, style, ...props }: MotionLinkProps) {
  return (
    <motion.div
      variants={linkVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="inline-block"
      style={style}
    >
      <Link className={className} {...props}>
        {children}
      </Link>
    </motion.div>
  );
}
