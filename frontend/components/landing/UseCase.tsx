"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Poppins, Inter } from "next/font/google";
import { ChevronRight } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const categories = [
  "Featured",
  "Lead Gen",
  "Marketing", 
  "Sales",
  "Growth",
  "Analytics",
  "Automation"
];

const useCases = [
  {
    id: 1,
    category: "Featured",
    title: "Reddit Lead Discovery",
    description: "Automatically find warm prospects discussing your industry on Reddit",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "Gmail", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/2a800b31805310aa7e66a69e5418fa00690c8447?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 2,
    category: "Featured",
    title: "Competitor Mention Alerts",
    description: "Get notified when competitors are mentioned negatively on Reddit",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "Slack", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/d63f85ba4135dced28843a0b237ce4cbe013537b?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 3,
    category: "Lead Gen",
    title: "Gaming Community Outreach",
    description: "Target crypto gaming communities to find play-to-earn enthusiasts",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "Discord", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/10815a12b7490498be53c31b79b84eaf776fcc3f?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 4,
    category: "Marketing",
    title: "Subreddit Intelligence",
    description: "Analyze subreddit culture and posting rules for better engagement",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "Notion", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/b8e021d4bf486876d3ccb34b072e74f69a875dc8?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 5,
    category: "Sales",
    title: "AI Reply Generation",
    description: "Generate contextual replies that match subreddit tone and culture",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "OpenAI", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/90d0c7fccfd7adb0c28de1420add02e558a3bab6?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 6,
    category: "Growth",
    title: "Lead Scoring & Prioritization",
    description: "Automatically score leads based on engagement and buying intent",
    integrations: [
      { name: "HubSpot", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/bc4fb40519b953f51853b7dc2634603678258927?placeholderIfAbsent=true" },
      { name: "Salesforce", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/c7138e0e05e4a40992417363eabf2705578e66ca?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 7,
    category: "Analytics",
    title: "Reddit Performance Tracking",
    description: "Track upvotes, replies, and engagement on your Reddit interactions",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "Analytics", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/ce88b7a51387b3ed8dbab1cb1ff8b44ed1f53780?placeholderIfAbsent=true" }
    ]
  },
  {
    id: 8,
    category: "Automation",
    title: "Scheduled Reddit Posting",
    description: "Automatically post replies at optimal times for maximum visibility",
    integrations: [
      { name: "Reddit", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true" },
      { name: "Zapier", src: "https://cdn.builder.io/api/v1/image/assets/TEMP/2a800b31805310aa7e66a69e5418fa00690c8447?placeholderIfAbsent=true" }
    ]
  }
];

export const UseCases = () => {
  const [activeCategory, setActiveCategory] = useState("Featured");

  const filteredUseCases = useCases.filter(useCase => 
    activeCategory === "Featured" ? useCase.category === "Featured" : useCase.category === activeCategory
  );

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="relative w-full max-w-7xl mx-auto mt-24 px-6" style={{transform: "translateZ(0px)"}}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`${poppins.className} text-4xl md:text-5xl font-black tracking-tighter text-white mb-4`}>
            How RedLead Powers Your Growth
          </h2>
          <p className={`${inter.className} text-lg text-white/70 max-w-2xl mx-auto`}>
            Discover how businesses use RedLead's AI-powered Reddit lead generation across different use cases.
          </p>
        </motion.div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center justify-center mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-white/10 ${
                activeCategory === category
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/80 hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUseCases.map((useCase) => (
            <motion.div
              key={useCase.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full"
              style={{transform: "translateZ(0px)"}}
            >
              <button className="group flex flex-col w-full rounded-2xl border border-white/[0.08] bg-zinc-900/40 hover:bg-zinc-800/60 p-6 h-full min-h-[240px] ring-1 ring-inset ring-white/[0.02] hover:ring-white/[0.12] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(255,255,255,0.06)] transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100">
                
                {/* Integration Icons */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-2">
                    {useCase.integrations.map((integration, index) => (
                      <img
                        key={index}
                        alt={integration.name}
                        className="w-6 h-6 object-contain"
                        title={integration.name}
                        src={integration.src}
                      />
                    ))}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-white break-words">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/70 group-hover:text-white/90 leading-relaxed break-words">
                  {useCase.description}
                </p>

                {/* Try Now Link */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center text-xs text-white/50 group-hover:text-white/70">
                    <span>Try now</span>
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
