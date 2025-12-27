/* components/FeaturesSection.tsx */
"use client";
import { motion } from "framer-motion";
import { Poppins, Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
});

// Utility Video Component for DRYness
function FeatureVideo({ src }: { src: string }) {
  // Set playbackRate as soon as metadata loads
  const handleRate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.playbackRate = 1.5;
  };
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      onLoadedMetadata={handleRate}
      tabIndex={-1}
      aria-hidden="true"
      className="relative z-10 w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700 select-none pointer-events-none bg-transparent"
      style={{
        backfaceVisibility: "hidden",
        outline: "none",
        background: "transparent",
        userSelect: "none",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}

export function FeaturesStart() {
  return (
    <section id="features" className="relative py-32 px-8 bg-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-orange-400/8 rounded-full blur-3xl" />

      <div className="relative max-w-8xl mx-auto">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className={`inline-block text-sm font-semibold tracking-wide uppercase text-orange-400 mb-4 ${inter.className}`}>
            Powerful Features
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
            Turn Reddit into your <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              lead generation machine
            </span>
          </h2>
        </motion.header>

        {/* 1 - Main Hero Feature */}
        <section className="relative flex flex-col items-center gap-16 py-32 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Stop scrolling. Start <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">selling.</span>
            </h3>
            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              While you waste hours manually searching Reddit for prospects, RedLead works 24/7 to discover and organize high-intent leads who are actively asking for solutions like yours.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] backdrop-blur-sm group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <FeatureVideo src="/1.mp4" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2 - AI-Generated Replies */}
        <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Every reply feels <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">authentically human</span>
            </h3>
            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              Smart AI that understands context and community vibes to craft replies that actually help people—not spammy sales pitches that get you banned from every subreddit.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <FeatureVideo src="/4.mp4" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3 - AI Summaries */}
        <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Skip the noise. Get the <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">insights.</span>
            </h3>
            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              No more scrolling through endless comment threads. Get instant summaries that highlight the pain points, buying signals, and opportunities you actually care about.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <FeatureVideo src="/3.mp4" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* 4 - Simple Integrations */}
        {/* <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Connect to your favorite <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">tools</span>
            </h3>
            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              Export leads to your CRM, get Slack notifications, or webhook to any service you use. Simple integrations that actually work—no enterprise sales calls required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <FeatureVideo src="/4.mp4" />
              </div>
            </div>
          </motion.div>
        </section> */}
      </div>
    </section>
  );
}
