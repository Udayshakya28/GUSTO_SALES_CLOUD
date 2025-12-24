"use client";
import React from "react";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const RedLeadHeader = () => {
  return (
    <div className="border-b border-zinc-800 bg-black">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-3xl font-bold tracking-tight text-white ${poppins.className}`}>
              red<span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">lead</span>
            </h1>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
