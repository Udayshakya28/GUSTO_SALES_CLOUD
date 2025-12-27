"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { X } from "lucide-react";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

export function WhyReddit() {
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <section className="relative py-24 px-8 bg-black overflow-hidden">
        {/* Background decoration - matching hero/features */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-orange-400/8 rounded-full blur-3xl" />

        {/* Enhanced Spotlight Beam - matching hero */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[600px] bg-gradient-radial from-orange-400/15 via-orange-300/8 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-radial from-orange-300/20 via-orange-200/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] bg-gradient-radial from-orange-200/25 to-transparent rounded-full blur-lg"></div>
        </div>

        <div className="relative z-20 mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-16 items-center">
            {/* Left Text Section */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:col-span-2 space-y-8"
            >
              {/* Small label - increased size */}
              <span className={`inline-block text-sm font-semibold tracking-wide uppercase text-orange-400 mb-4 ${inter.className}`}>
                The New Lead Gen Goldmine
              </span>

              {/* Main heading - significantly increased */}
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
                Why <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Reddit</span> Wins the AI Era
              </h2>

              {/* Body text - increased size */}
              <p className={`text-base font-medium text-white/80 leading-relaxed ${inter.className}`}>
                AI and search engines now favor authentic, human conversations—making Reddit the new goldmine for high-intent leads who are actively seeking solutions.
              </p>

              {/* Stats list - increased text and bullet size */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className={`text-base font-medium text-white/80 ${inter.className}`}>
                    <span className="font-bold text-white">73%</span> of Google's first-page results feature Reddit threads
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className={`text-base font-medium text-white/80 ${inter.className}`}>
                    <span className="font-bold text-white">90%</span> of users add 'reddit' to searches for trusted answers
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className={`text-base font-medium text-white/80 ${inter.className}`}>
                    <span className="font-bold text-white">#1</span> source for solution-seeking AI queries and recommendations
                  </p>
                </div>
              </div>

              {/* CTA Button - matching hero button style */}
              <div className="pt-8">
                <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors">
                  <span className={`${inter.className} font-semibold`}>Start finding Reddit leads</span>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
                    <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Right Image Section - Slightly larger container */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative md:col-span-3 cursor-pointer group max-w-3xl"
              onClick={() => setLightboxOpen(true)}
            >
              {/* Enhanced glowing border frame effect */}
              <div className="absolute -inset-3 bg-gradient-to-r from-orange-500/50 via-orange-400/60 to-orange-500/50 rounded-xl blur-lg opacity-70 group-hover:opacity-90 transition-all duration-500"></div>
              
              {/* Secondary glow layer */}
              <div className="absolute -inset-6 bg-gradient-radial from-orange-500/25 via-orange-400/15 to-transparent rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
              
              {/* Frame container */}
              <div className="relative rounded-xl overflow-hidden border border-orange-500/40 shadow-xl shadow-orange-500/20 bg-gray-900/50 p-4 group-hover:border-orange-400/60 group-hover:shadow-orange-500/30 transition-all duration-500 backdrop-blur-sm">
                <img
                  src="/redd.png"
                  alt="Infographic showing Reddit's dominance in AI and Search"
                  className="relative z-10 w-full h-auto object-contain rounded-lg transform group-hover:scale-[1.01] transition-transform duration-700"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              </div>

              {/* Click hint */}
              <div className="absolute top-6 right-6 bg-black/60 text-white/70 px-3 py-2 rounded text-sm backdrop-blur-sm border border-orange-400/20">
                Click to expand
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simplified Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
              
              <div className="relative overflow-hidden rounded-xl border border-orange-400/30">
                <img
                  src="/redd.png"
                  alt="Reddit dominance infographic - Full view"
                  className="w-full h-auto"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
