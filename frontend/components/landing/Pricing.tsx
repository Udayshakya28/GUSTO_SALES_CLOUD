"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { useUser } from "@clerk/nextjs"; // 👈 NEW: Import Clerk's useUser hook
import Link from "next/link"; // 👈 NEW: Import Next.js Link component
import { Check, X, Zap, Crown, Building, Gift, Star, ArrowRight } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Interfaces and variants remain the same...
interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  cta: string;
  badge?: string;
}

interface Savings {
  amount: number;
  percentage: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }
  }
};


const PricingComponent: React.FC = () => {
  const [isYearly, setIsYearly] = React.useState(false);
  const { isSignedIn } = useUser(); // 👈 NEW: Get user's sign-in status

  const plans: PricingPlan[] = [
    {
      name: "Free",
      description: "Perfect for trying out Redlead",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Gift,
      color: "gray",
      features: [
        "1 Project",
        "5 Keywords", 
        "25 Leads per month",
        "Basic support"
      ],
      limitations: [
        "No AI features",
        "No competitor tracking"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Starter",
      description: "For solopreneurs & indie hackers",
      monthlyPrice: 19,
      yearlyPrice: 15,
      icon: Zap,
      color: "blue",
      features: [
        "1 Project",
        "15 Keywords",
        "200 Leads per month",
        "AI Intent Analysis",
        "AI Replies (75/month)"
      ],
      limitations: [
        "No competitor tracking"
      ],
      popular: false,
      cta: "Start 7-Day Trial"
    },
    {
      name: "Pro",
      description: "Best for growing startups",
      monthlyPrice: 49,
      yearlyPrice: 39,
      icon: Crown,
      color: "orange",
      features: [
        "3 Projects",
        "50 Keywords",
        "1,000 Leads per month",
        "AI Replies (300/month)",
        "Competitor Tracking",
        "Priority Support"
      ],
      limitations: [],
      popular: true,
      cta: "Start 7-Day Trial",
    },
    {
      name: "Enterprise",
      description: "For large teams & agencies",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      icon: Building,
      color: "purple",
      features: [
        "Unlimited Projects",
        "Unlimited Keywords",
        "Unlimited Leads",
        "Team Collaboration",
        "Dedicated Manager",
        "API Access"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const getPrice = (plan: PricingPlan): string | number => {
    if (plan.monthlyPrice === "Custom") return "Custom";
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: PricingPlan): Savings | null => {
    if (plan.monthlyPrice === "Custom" || plan.monthlyPrice === 0) return null;
    const monthlyCost = (plan.monthlyPrice as number) * 12;
    const yearlyCost = (plan.yearlyPrice as number) * 12;
    const savings = monthlyCost - yearlyCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  // 👈 NEW: Helper function to determine the correct link for the CTA button
  const getCtaLink = (planName: string) => {
    if (planName === "Enterprise") {
      return "mailto:sales@redlead.com"; // Or your sales email
    }
    return isSignedIn ? "/dashboard" : "/sign-up";
  };

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-full blur-3xl opacity-50"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 25, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-orange-500/8 to-orange-400/4 rounded-full blur-3xl opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight ${poppins.className}`}>
              Simple, Transparent <span className="text-orange-500">Pricing</span>
            </h2>
            <p className={`text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
              Choose the perfect plan to supercharge your Reddit lead generation
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex w-fit overflow-hidden rounded-md border border-gray-700 bg-gray-800">
              <button
                onClick={() => setIsYearly(false)}
                className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 ${
                  !isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'
                } ${inter.className}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 ${
                  isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'
                } ${inter.className}`}
              >
                Yearly (save 20%)
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const price = getPrice(plan);
              
              // Determine the correct component: Link for internal nav, <a> for external
              const CtaWrapper = plan.name === 'Enterprise' ? 'a' : Link;
              
              return (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  className={`relative h-full rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                    plan.popular
                      ? 'border-orange-400/50 bg-gradient-to-br from-orange-600/20 via-orange-500/15 via-orange-400/10 to-orange-300/5 shadow-orange-500/30 backdrop-blur-sm'
                      : 'border-gray-700 bg-gray-900/30 hover:border-gray-600 backdrop-blur-sm'
                  }`}
                >
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex flex-col gap-4">
                      {/* ... Plan Header and Features ... */}
                      <div className="flex flex-col gap-3">
                        <h3 className={`text-lg font-semibold text-white ${poppins.className}`}>
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-semibold text-white ${poppins.className}`}>
                            {price === "Custom" ? "Custom" : (price === 0 ? "Free" : `$${price}`)}
                          </span>
                          {price !== "Custom" && price !== 0 && (
                            <span className={`text-sm text-gray-400 ${inter.className}`}>/mo</span>
                          )}
                        </div>
                      </div>
                      <hr className="border-gray-700" />
                      <div className="flex flex-col gap-4">
                        <p className={`text-sm font-semibold text-gray-400 ${inter.className}`}>
                          {plan.name === "Free" ? "Includes" : `Everything in ${plans[plans.findIndex(p => p.name === plan.name) - 1]?.name}, plus`}
                        </p>
                        <div className="flex flex-col gap-2">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                              <span className={`text-sm text-gray-200 ${inter.className}`}>{feature}</span>
                            </div>
                          ))}
                          {plan.limitations.map((limitation, limitIndex) => (
                            <div key={limitIndex} className="flex items-center gap-2">
                              <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                              <span className={`text-sm text-gray-500 ${inter.className}`}>{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* --- CORRECTED: CTA Button wrapped in Link/a tag --- */}
                    <div className="mt-6">
                       <CtaWrapper href={getCtaLink(plan.name)}>
                         <motion.div
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className={`w-full rounded-lg py-3 px-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                            plan.popular
                              ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 text-white hover:from-orange-700 hover:via-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/25'
                              : plan.name === 'Free'
                              ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-sm'
                              : 'bg-gray-800 text-white border border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                          } ${poppins.className}`}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </CtaWrapper>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Additional Info */}
          <motion.div variants={itemVariants} className="text-center">
            <p className={`text-sm text-gray-400 ${inter.className}`}>
              All plans include 7-day free trial. No credit card required.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingComponent;