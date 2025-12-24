"use client";
import React, { useEffect, useState, useId } from 'react';
import { motion } from 'framer-motion';
import { Inter, Poppins } from 'next/font/google';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { 
  CloudArrowUpIcon, 
  LockClosedIcon, 
  ArrowPathIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
 
const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Sparkles component for the "Supercharge" word
const SuperchargeSparkles = ({ children }: { children: React.ReactNode }) => {
  const [init, setInit] = useState(false);
  const particleId = useId();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="relative inline-block">
      {/* Particles Background */}
      {init && (
        <div className="absolute inset-0 -m-4">
          <Particles
            id={particleId}
            className="h-full w-full"
            options={{
              fullScreen: { enable: false },
              background: { color: { value: "transparent" } },
              fpsLimit: 120,
              particles: {
                color: { value: "#f97316" },
                move: {
                  enable: true,
                  speed: { min: 0.5, max: 2 },
                  direction: "none",
                  outModes: { default: "out" },
                },
                number: {
                  value: 50,
                  density: { enable: true, width: 200, height: 200 }
                },
                opacity: {
                  value: { min: 0.1, max: 0.8 },
                  animation: {
                    enable: true,
                    speed: 6,
                    sync: false,
                  },
                },
                shape: { type: "circle" },
                size: {
                  value: { min: 1, max: 3 },
                },
              },
              detectRetina: true,
            }}
          />
        </div>
      )}
      
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-400/30 to-orange-500/20 blur-xl rounded-lg"></div>
          
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent"
            />
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
                delay: 0.3,
                ease: "easeInOut"
              }}
              className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent"
            />
          </div>
          
          <div className="relative z-10 bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const features: Feature[] = [
  {
    name: 'AI-Powered Discovery',
    description: 'Analyzes your website to find customers based on actual problems, not just keywords.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Intent-Based Scoring',
    description: 'Prioritizes solution-seekers with clear pain points at the top of your feed.',
    icon: LockClosedIcon,
  },
  {
    name: 'Context-Aware Replies',
    description: 'Generates authentic responses tailored to each subreddit\'s culture.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Competitor Monitoring',
    description: 'Alerts you when users express frustration with competitors.',
    icon: FingerPrintIcon,
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Black Background - Matching Hero Component */}
      <div className="absolute inset-0 z-10">
        {/* Primary Black Base */}
        <div className="absolute inset-0 bg-black"></div>
        
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
       
        {/* Minimal Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
    
        {/* Subtle Floating Orbs */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-white/5 to-white/2 rounded-full blur-3xl opacity-30"
        />
        
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-white/3 to-white/1 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-4xl text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${poppins.className}`}>
              <SuperchargeSparkles>
                Supercharge
              </SuperchargeSparkles>
              <span className="text-white"> your business using reddit</span>
            </h2>
            <p className={`text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
              Transform Reddit into your lead generation machine with AI-powered discovery and intelligent automation.
            </p>
          </motion.div>
        </div>
        
        {/* Modern Features Grid */}
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Orange Glowy Border Card */}
                <div className="
                  relative h-full bg-white/[0.02] backdrop-blur-sm 
                  border-2 border-orange-500/80 rounded-2xl p-8
                  transition-all duration-300
                  shadow-[0_0_24px_0_rgba(255,69,0,0.25)]
                  hover:shadow-[0_0_48px_8px_rgba(255,69,0,0.5)]
                  before:absolute before:inset-0 before:rounded-2xl
                  before:pointer-events-none
                  before:opacity-70
                  before:bg-gradient-to-br before:from-orange-500/20 before:to-transparent
                ">
                  <div className="relative z-10 space-y-6">
                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 transition-all duration-300">
                      <feature.icon className="w-7 h-7 text-orange-400 transition-colors duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className={`text-xl font-semibold text-white transition-colors duration-300 ${poppins.className}`}>
                        {feature.name}
                      </h3>
                      <p className={`text-gray-400 leading-relaxed transition-colors duration-300 ${inter.className}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <span className={inter.className}>Never let a lead slip away</span>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Minimal Floating Elements - From Hero */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-20 right-20 size-1 bg-white/20 rounded-full z-20"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, 10, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-32 left-16 size-1 bg-white/15 rounded-full z-20"
      />
    </section>
  );
}
