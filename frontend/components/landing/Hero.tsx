"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';
import { FaReddit } from "react-icons/fa";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-black" style={{
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      willChange: 'scroll-position'
    }}>

      {/* Background Effects */}
      <div className="absolute inset-0 z-5">
        <div className="absolute inset-0 bg-black"></div>
        {/* ... rest of your background effects ... */}
      </div>

      {/* Main Content */}
      <main className="px-6 py-4 max-md:px-4 relative z-10 flex items-center justify-center min-h-screen" style={{
        transform: 'translateZ(0)',
        contain: 'layout style paint'
      }}>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mx-auto max-w-[98vw]">
          <div className="absolute inset-0">
            <div className="w-full h-full bg-black"></div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 px-16 pt-20 pb-12 text-center max-md:px-8 max-md:pt-16 max-md:pb-8">

            {/* Tagline and Buttons */}
            <div className="overflow-visible mb-8">
               {/* ... Your h1 motion component ... */}
               <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] text-white mb-0 overflow-visible ${poppins.className}`}
                style={{ overflow: 'visible' }}
              >
                Turn{" "}
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
                  className="inline-block relative z-20 overflow-visible"
                  style={{ overflow: 'visible', display: 'inline-block' }}
                >
                  <FaReddit className="inline size-8 sm:size-10 lg:size-12 xl:size-14 text-orange-500 mx-2 relative z-20" />
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent inline-block overflow-visible"
                  style={{
                    overflow: 'visible',
                    lineHeight: '0.9',
                    display: 'inline-block'
                  }}
                >
                  Reddit{"     "}
                </motion.span>
                {" "}
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="inline-block"
                  style={{ overflow: 'visible' }}
                >
                  into leads
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
                <FaReddit className="w-4 h-4 text-orange-500" />
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
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
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
                <div className="absolute -inset-2 bg-transparent rounded-3xl [background:conic-gradient(from_90deg_at_50%_50%,#fb923c_0%,#f97316_50%,#ea580c_100%)] blur-lg" />
                
                {/* Animated Breathing Glow Layers */}
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-4 bg-orange-400/40 blur-2xl rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -inset-8 bg-orange-500/30 blur-3xl rounded-full"
                />

                {/* Image Container */}
                <div className="relative overflow-hidden rounded-xl shadow-2xl shadow-orange-500/20 z-10 border border-white/10">
                  <Image
                    src="/Redlead1.png"
                    alt="RedLead Dashboard Interface"
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