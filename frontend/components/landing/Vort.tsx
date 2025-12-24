"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';
import { ArrowRight, Zap } from "lucide-react";
import { WavyBackground } from "../ui/wavy-background";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export function Vort() {
  return (
    <WavyBackground 
      className="w-full flex items-center justify-center px-4"
      containerClassName="relative h-96 lg:h-[500px]" // Override the default h-screen

      colors={[
        "#FF4500", // Primary orange
        "#FF6B00", // Secondary orange
        "#FF8C00", // Light orange
        "#FF2500", // Red-orange
        "#FF7A00", // Mid orange
      ]}
      waveWidth={40}
      backgroundFill="rgb(0, 0, 0)" // Changed from gray-900 to black
      blur={10}
      speed="slow"
      waveOpacity={0.4}
    >
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Main CTA Headline */}
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight ${poppins.className}`}>
            What Are You{" "}
            <span className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent">
              Waiting For?
            </span>
          </h2>

          {/* Supporting Text */}
          <p className={`text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
            Stop missing out on qualified leads. Start turning Reddit conversations into customers today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </motion.button>
        
          </div>

          {/* Trust Signal */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className={inter.className}>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className={inter.className}>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className={inter.className}>Cancel anytime</span>
            </div>
          </motion.div> */}
        </motion.div>
      </div>
    </WavyBackground>
  );
}
