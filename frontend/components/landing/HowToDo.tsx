"use client";
import React from "react";
import {
  LinkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Inter, Poppins } from 'next/font/google';
import { FaReddit, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const steps = [
  {
    title: "Connect Your Business",
    description: "Paste your website URL. AI analyzes your business and finds ideal customers.",
    icon: LinkIcon,
    action: "Start Setup",
    href: "/setup"
  },
  {
    title: "AI Finds Your Leads", 
    description: "Our system scans Reddit 24/7, finding prospects actively seeking your solutions.",
    icon: MagnifyingGlassIcon,
    action: "See How It Works",
    href: "/how-it-works"
  },
  {
    title: "Start Converting",
    description: "Get qualified leads with AI-generated responses ready to send.",
    icon: ChatBubbleLeftRightIcon,
    action: "View Examples",
    href: "/examples"
  },
];

export function HowToDo() {
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
    <section className="relative bg-black py-16 md:py-24">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,165,0,0.05),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 ${poppins.className}`}>
            Get Started in{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className={`text-xl text-gray-400 max-w-2xl mx-auto ${inter.className}`}>
            From setup to your first qualified lead in under 5 minutes
          </p>
        </header>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <div key={index} className="h-full">
                <div className="h-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-8 hover:border-orange-500/50 hover:bg-zinc-900/90 transition-all duration-300 group backdrop-blur-sm">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className={`text-white text-sm font-bold ${poppins.className}`}>
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 bg-zinc-800/80 border border-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300">
                      <IconComponent className="w-6 h-6 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 mb-6">
                    <h3 className={`text-xl font-bold text-white group-hover:text-orange-50 transition-colors ${poppins.className}`}>
                      <Link href={step.href} className="hover:underline">
                        {step.title}
                      </Link>
                    </h3>
                    
                    <p className={`text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed ${inter.className}`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
                    <Link href={step.href} className="flex items-center space-x-2 text-sm font-medium">
                      <span className={inter.className}>{step.action}</span>
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* CORRECTED BUTTONS */}
            <button
              onClick={handleGetStartedClick}
              className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              <FaReddit className="w-5 h-5 text-orange-500" />
              <span className={`${inter.className} font-semibold`}>Get started for free</span>
            </button>

            <button
              onClick={scrollToPricing}
              className="inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105"
            >
              <span className={`${inter.className} font-semibold`}>See plans & pricing</span>
            </button>
          </div>

          <p className={`${inter.className} text-zinc-400 font-medium`}>
            No credit card required • Get started in seconds
          </p>
        </div>
      </div>
    </section>
  );
}