// frontend/components/onboarding/Step1_AnalyzeUrl.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Inter, Poppins } from 'next/font/google';
import { LoaderFive } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface Props {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

// Professional pulsating text loader stages with proper theme colors
const PulsatingTextLoader = () => {
  const [currentStage, setCurrentStage] = useState(0);
  
  const stages = [
    "Scanning your website",
    "AI analyzing content", 
    "Generating insights"
  ];

  useEffect(() => {
    if (currentStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStage, stages.length]);

  return (
    <div className="space-y-6">
      <LoaderFive text="Analyzing your website..." />
      
      <div className="space-y-4 mt-8">
        {stages.map((stage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index <= currentStage ? 1 : 0.3
            }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.span 
              className={`text-lg font-medium ${
                index === currentStage 
                  ? 'text-orange-400' 
                  : index < currentStage 
                    ? 'text-gray-300' 
                    : 'text-gray-500'
              } ${inter.className}`}
              animate={{ 
                opacity: index === currentStage ? [0.6, 1, 0.6] : index < currentStage ? 1 : 0.4
              }}
              transition={{ 
                duration: 2, 
                repeat: index === currentStage ? Infinity : 0,
                ease: "easeInOut" 
              }}
            >
              {stage}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const Step1_AnalyzeUrl = ({ onAnalyze, isLoading, error }: Props) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !isLoading) {
      onAnalyze(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl"
    >
      {/* Clean Header */}
      <div className="text-center mb-12">
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 mb-6">
          Step 1 of 3
        </Badge>
        
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6 ${poppins.className}`}>
          Tell us about your{" "}
          <span className="text-orange-500">
            product
          </span>
        </h1>
        
        <p className={`text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
          Share your website URL and our AI will analyze your product to create the perfect Reddit lead generation strategy.
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-300">
        <CardContent className="p-8 sm:p-12">
          {!isLoading ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* URL Input */}
              <div className="space-y-4">
                <label className={`block text-lg font-semibold text-white ${inter.className}`}>
                  Website URL
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400">
                    <GlobeAltIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-awesome-product.com"
                    className={`w-full h-16 pl-12 pr-6 text-lg bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all text-white placeholder-gray-500 hover:border-zinc-700 ${inter.className}`}
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  We'll analyze your landing page, features, and target audience
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !url}
                  className={`group inline-flex items-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transform-gpu active:scale-[0.98] ${inter.className}`}
                >
                  <span>Analyze My Website</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
          ) : (
            /* Professional Loading State */
            <div className="text-center py-12">
              <PulsatingTextLoader />
              
              <Card className="mt-8 bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-4">
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    This process typically takes 15-45 seconds depending on your website complexity
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <AlertDescription className={inter.className}>
              {error}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Bottom hint */}
      {!isLoading && (
        <div className="text-center mt-8">
          <p className={`text-sm text-gray-500 ${inter.className}`}>
            This usually takes 10-30 seconds • We never store your data without permission
          </p>
        </div>
      )}
    </motion.div>
  );
};
