"use client";
import { motion } from "motion/react";
import React from "react";

 

export const LoaderFive = ({ text }: { text: string }) => {
  return (
    <div className="font-sans font-bold text-white [--shadow-color:theme(colors.orange.400)]">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block text-lg font-semibold"
          style={{ fontFamily: "'Poppins', sans-serif" }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.08, 1],
            textShadow: [
              "0 0 0 theme(colors.orange.400)",
              "0 0 2px theme(colors.orange.400), 0 0 4px theme(colors.orange.500)",
              "0 0 0 theme(colors.orange.400)",
            ],
            opacity: [0.6, 1, 0.6],
            color: [
              "rgb(254 215 170)", // orange-200
              "rgb(251 146 60)",  // orange-400  
              "rgb(254 215 170)"  // orange-200
            ]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 0.06,
            ease: "easeInOut",
            repeatDelay: 1.5,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};
