"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  intensity?: "low" | "medium" | "high";
}

export function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up",
  intensity = "medium"
}: ScrollRevealProps) {
  const distances = {
    low: 10,
    medium: 30,
    high: 50,
  };

  const directions = {
    up: { y: distances[intensity], x: 0 },
    down: { y: -distances[intensity], x: 0 },
    left: { x: distances[intensity], y: 0 },
    right: { x: -distances[intensity], y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}
