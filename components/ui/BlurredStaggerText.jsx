"use client";
import * as React from "react";
import { motion } from "motion/react";

export const BlurredStagger = ({ text = "Welcome" }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  return (
    <motion.h2
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="gradient-heading text-center font-bold leading-tight"
      style={{
        fontSize: 'clamp(2.5rem, 8vw, 6rem)',
        background: 'linear-gradient(90deg, #C08552, #FFF8F0, #8C5A3C)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'block',
        width: '100%',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letterAnimation}
          transition={{ duration: 0.3 }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h2>
  );
};

export default BlurredStagger;
