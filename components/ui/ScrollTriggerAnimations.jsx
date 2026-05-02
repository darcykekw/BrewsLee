'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'motion/react';
import Lenis from 'lenis';

const defaultOptions = {
  duration: 0.08,
  lerp: 0.1,
  smoothWheel: true,
  touchMultiplier: 2,
  infinite: false,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
};

export function useSmoothScroll(options = {}) {
  const lenisRef = React.useRef(null);
  React.useEffect(() => {
    const mergedOptions = { ...defaultOptions, ...options };
    lenisRef.current = new Lenis({
      duration: mergedOptions.duration,
      lerp: mergedOptions.lerp,
      smoothWheel: mergedOptions.smoothWheel,
      touchMultiplier: mergedOptions.touchMultiplier,
      infinite: mergedOptions.infinite,
      orientation: mergedOptions.orientation,
      gestureOrientation: mergedOptions.gestureOrientation,
      easing: mergedOptions.easing,
    });
    function raf(time) { lenisRef.current?.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => { lenisRef.current?.destroy(); lenisRef.current = null; };
  }, []);
  return { lenis: lenisRef.current };
}

const ContainerScrollAnimationContext = React.createContext(undefined);

export function useContainerScrollAnimationContext() {
  const context = React.useContext(ContainerScrollAnimationContext);
  if (!context) throw new Error('Must be used within ContainerScrollAnimation');
  return context;
}

export function ContainerScrollAnimation({ spacerClass, className, children, ...props }) {
  const scrollRef = React.useRef(null);
  useSmoothScroll();
  const { scrollYProgress } = useScroll({ target: scrollRef });
  return (
    <ContainerScrollAnimationContext.Provider value={{ scrollYProgress }}>
      <div ref={scrollRef} className={cn('relative', className)} {...props}>
        {children}
        <div className={cn('w-full h-96', spacerClass)} />
      </div>
    </ContainerScrollAnimationContext.Provider>
  );
}

export function ContainerScrollTranslate({ yRange = [0, 384], inputRange = [0, 1], style, className, ...props }) {
  const { scrollYProgress } = useContainerScrollAnimationContext();
  const y = useTransform(scrollYProgress, inputRange, yRange);
  return <motion.div style={{ y, ...style }} className={cn('relative', className)} {...props} />;
}

export function ContainerScrollScale({ scaleRange = [1.2, 1], inputRange = [0, 1], className, style, ...props }) {
  const { scrollYProgress } = useContainerScrollAnimationContext();
  const scale = useTransform(scrollYProgress, inputRange, scaleRange);
  return <motion.div className={className} style={{ scale, ...style }} {...props} />;
}

export function ContainerScrollInset({ inputRange = [0, 1], insetRangeY = [45, 0], insetXRange = [45, 0], roundednessRange = [16, 16], className, style, ...props }) {
  const { scrollYProgress } = useContainerScrollAnimationContext();
  const insetY = useTransform(scrollYProgress, inputRange, insetRangeY);
  const insetX = useTransform(scrollYProgress, inputRange, insetXRange);
  const roundedness = useTransform(scrollYProgress, inputRange, roundednessRange);
  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${roundedness}px)`;
  return <motion.div className={className} style={{ clipPath, ...style }} {...props} />;
}

export function ContainerScrollRadius({ radiusRange = [9999, 16], inputRange = [0, 1], className, style, ...props }) {
  const { scrollYProgress } = useContainerScrollAnimationContext();
  const borderRadius = useTransform(scrollYProgress, inputRange, radiusRange);
  return <motion.div layout className={className} style={{ borderRadius, ...style }} {...props} />;
}

export function ContainerScrollInsetX({
  insetRange = [48, 0],
  inputRange = [0, 1],
  className,
  style,
  ...props
}) {
  const { scrollYProgress } = useContainerScrollAnimationContext();
  const xInset = useTransform(scrollYProgress, inputRange, insetRange);
  const clipPath = useMotionTemplate`inset(0px ${xInset}px)`;
  return (
    <motion.div
      className={className}
      style={{ clipPath, ...style }}
      {...props}
    />
  );
}
