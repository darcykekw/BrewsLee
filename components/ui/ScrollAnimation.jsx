'use client';
import { motion } from 'framer-motion';

const variants = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  },
  left: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  },
  right: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }
};

export default function ScrollAnimation({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className = '', 
  once = true 
}) {
  const selectedVariant = variants[direction] || variants.up;
  
  const customVariant = {
    hidden: selectedVariant.hidden,
    visible: {
      ...selectedVariant.visible,
      transition: {
        ...selectedVariant.visible.transition,
        delay: delay
      }
    }
  };

  return (
    <motion.div
      variants={customVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: once, margin: "-10%" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
