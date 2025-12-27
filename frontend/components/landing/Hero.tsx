"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';
import { FaReddit } from "react-icons/fa";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "./AnimatedBackground";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

export const Hero = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const handleGetStartedClick = () => {
    if (isLoaded) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/sign-up');
      }
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      willChange: 'scroll-position'
    }}>

      {/* Animated Background with moving particles */}
      <AnimatedBackground />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Optional: Add blurred gradient circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="px-6 py-4 max-md:px-4 relative z-10 flex items-center justify-center min-h-screen" style={{
        transform: 'translateZ(0)',
        contain: 'layout style paint'
      }}>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-visible mx-auto max-w-[98vw]">
          {/* Removed solid background to let bubbles show through */}

          {/* Main Hero Content */}
          <div className="relative px-16 pt-20 pb-12 text-center max-md:px-8 max-md:pt-16 max-md:pb-8">

            {/* Tagline and Buttons */}
            <div className="overflow-visible mb-8">
               {/* ... Your h1 motion component ... */}
               <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.05] text-white mb-0 overflow-visible ${poppins.className}`}
                style={{ overflow: 'visible' }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent block overflow-visible"
                  style={{
                    overflow: 'visible',
                    lineHeight: '1.1'
                  }}
                >
                  AI that turns social signals
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent block overflow-visible"
                  style={{
                    overflow: 'visible',
                    lineHeight: '1.1'
                  }}
                >
                  into real customers
                </motion.span>
              </motion.h1>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            >
              {/* CORRECTED BUTTONS */}
              <button
                onClick={handleGetStartedClick}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors"
              >
                <FaReddit className="w-4 h-4 text-cyan-400" />
                <span className={`${inter.className} font-semibold`}>Get started for free</span>
              </button>
              <button
                onClick={scrollToPricing}
                className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                <span className={`${inter.className} font-semibold`}>See plans & pricing</span>
              </button>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className={`${inter.className} text-white/80 font-medium text-sm`}
              style={{ marginTop: '1rem' }}
            >
              Already have Reddit leads?{" "}
              <Link
                href="/dashboard"
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
              >
                Open dashboard
              </Link>
            </motion.p>
        
            {/* ... rest of your component (Image, etc.) ... */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="relative mx-auto mt-20" // <-- REMOVED max-w- class to make it larger
            >
              <div className="relative">
                {/* Static Glow Layers */}
                <div className="absolute -inset-2 bg-transparent rounded-3xl [background:conic-gradient(from_90deg_at_50%_50%,#11DFFF_0%,#0ea5e9_50%,#0284c7_100%)] blur-lg" />
                
                {/* Animated Breathing Glow Layers */}
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-4 bg-cyan-400/40 blur-2xl rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -inset-8 bg-cyan-500/30 blur-3xl rounded-full"
                />

                {/* Image Container */}
                <div className="relative overflow-hidden rounded-xl shadow-2xl shadow-cyan-500/20 z-10 border border-white/10">
                  <Image
                    src="/Dashboard.png"
                    alt="Gusto Sales Cloud Dashboard Interface"
                    width={5040}
                    height={3360}
                    quality={100}
                    priority
                    className="relative z-10 w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};