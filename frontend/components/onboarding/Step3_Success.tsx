"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from './MainFlow';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircleIcon, 
  ArrowLeftIcon,
  ClockIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { LoaderFive } from "@/components/ui/loader";
import { useAuth, useUser } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface Props {
  analysisResult: AnalysisResult;
  onBack: () => void;
  onComplete: () => void;
  error: string | null;
}

export const Step3_FindLeads: React.FC<Props> = ({
  analysisResult,
  onBack,
  onComplete,
  error
}) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isSearching, setIsSearching] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [searchStage, setSearchStage] = useState('');
  const [leadsFound, setLeadsFound] = useState(0);

  const startLeadDiscovery = async () => {
    setIsSearching(true);
    setSearchStage('Initializing search...');

    try {
      const token = await getToken();

      // Simulate search stages for user feedback
      const stages = [
        'Connecting to Reddit...',
        'Analyzing target subreddits...',
        'Scanning conversations...',
        'Filtering relevant leads...',
        'Scoring opportunities...',
        'Finalizing results...'
      ];

      // Update search stage every 2 seconds
      for (let i = 0; i < stages.length; i++) {
        setSearchStage(stages[i]);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const response = await fetch('https://redlead.onrender.com/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          websiteUrl: analysisResult.websiteUrl,
          generatedDescription: analysisResult.generatedDescription,
          generatedKeywords: analysisResult.generatedKeywords,
          competitors: []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to discover leads.');
      }

      const result = await response.json();
      setLeadsFound(result.leadsFound || 0);
      setSearchComplete(true);
      
      // Auto-complete after showing results
      setTimeout(() => {
        onComplete();
      }, 3000);

    } catch (err: any) {
      console.error('Lead discovery failed:', err);
      setSearchStage(`Error: ${err.message}`);
    } finally {
      setIsSearching(false);
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
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 mb-6">
          Step 3 of 3
        </Badge>
        
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6 ${poppins.className}`}>
          Find Your{" "}
          <span className="text-orange-500">
            First Leads
          </span>
        </h1>
        
        <p className={`text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
          {searchComplete 
            ? "Great! We've found your first leads and they're waiting in your dashboard."
            : "Now let's discover high-intent prospects who are actively looking for solutions like yours."
          }
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-300">
        <CardContent className="p-8 sm:p-12">
          
          <AnimatePresence mode="wait">
            {!isSearching && !searchComplete && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Ready State */}
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                    <MagnifyingGlassIcon className="w-10 h-10 text-orange-500" />
                  </div>
                  
                  <div>
                    <h3 className={`text-2xl font-bold text-white mb-3 ${poppins.className}`}>
                      Ready to Find Your Leads
                    </h3>
                    <p className={`text-gray-400 ${inter.className}`}>
                      We'll search Reddit using your account to find people actively discussing problems your product solves.
                    </p>
                  </div>

                  {/* Search Details */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-4">
                    <h4 className={`text-lg font-semibold text-white ${poppins.className}`}>
                      What we'll search for:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-orange-400 font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.generatedKeywords.slice(0, 3).map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs border-orange-500/20 text-orange-400">
                              {keyword}
                            </Badge>
                          ))}
                          {analysisResult.generatedKeywords.length > 3 && (
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              +{analysisResult.generatedKeywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">Connected as:</span>
                        <p className="text-zinc-300 mt-1">u/{String(user?.publicMetadata?.redditUsername)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Email Notification Info */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                      <div className="text-left">
                        <p className={`text-blue-400 font-medium text-sm ${inter.className}`}>
                          Email notification enabled
                        </p>
                        <p className={`text-blue-300/80 text-xs ${inter.className}`}>
                          We'll email you at {user?.emailAddresses?.[0]?.emailAddress} when leads are found
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Search Button */}
                <div className="text-center">
                  <Button
                    onClick={startLeadDiscovery}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] transform-gpu active:scale-[0.98]"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span>Start Finding Leads</span>
                  </Button>
                </div>
              </motion.div>
            )}

            {isSearching && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Searching State */}
                <div className="text-center space-y-6">
                  <LoaderFive text="Searching for leads..." />
                  
                  <div>
                    <h3 className={`text-2xl font-bold text-white mb-3 ${poppins.className}`}>
                      Discovering Your Leads
                    </h3>
                    <motion.p 
                      key={searchStage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-orange-400 font-medium ${inter.className}`}
                    >
                      {searchStage}
                    </motion.p>
                  </div>

                  {/* Progress Steps */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                    <div className="space-y-3">
                      {[
                        'Analyzing your business profile',
                        'Identifying target subreddits',
                        'Scanning recent conversations',
                        'Filtering high-intent leads',
                        'Preparing your dashboard'
                      ].map((step, index) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0.3 }}
                          animate={{ 
                            opacity: searchStage.includes(step.split(' ')[0]) ? 1 : 0.3,
                            scale: searchStage.includes(step.split(' ')[0]) ? 1.02 : 1
                          }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            searchStage.includes(step.split(' ')[0]) ? 'bg-orange-500' : 'bg-zinc-600'
                          }`} />
                          <span className={`${
                            searchStage.includes(step.split(' ')[0]) ? 'text-white' : 'text-zinc-400'
                          } ${inter.className}`}>
                            {step}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-5 h-5 text-yellow-400" />
                      <p className={`text-yellow-400 text-sm ${inter.className}`}>
                        This process typically takes 30-60 seconds. Please don't close this tab.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {searchComplete && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Success State */}
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="w-10 h-10 text-green-400" />
                  </div>
                  
                  <div>
                    <h3 className={`text-2xl font-bold text-white mb-3 ${poppins.className}`}>
                      Leads Found Successfully!
                    </h3>
                    <p className={`text-gray-400 ${inter.className}`}>
                      We've discovered {leadsFound} potential leads and they're now available in your dashboard.
                    </p>
                  </div>

                  {/* Results Summary */}
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className={`text-2xl font-bold text-green-400 ${poppins.className}`}>
                          {leadsFound}
                        </div>
                        <div className={`text-sm text-green-300 ${inter.className}`}>
                          Leads Found
                        </div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold text-blue-400 ${poppins.className}`}>
                          ✓
                        </div>
                        <div className={`text-sm text-blue-300 ${inter.className}`}>
                          Email Sent
                        </div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold text-orange-400 ${poppins.className}`}>
                          ⚡
                        </div>
                        <div className={`text-sm text-orange-300 ${inter.className}`}>
                          Campaign Active
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                      <p className={`text-blue-400 text-sm ${inter.className}`}>
                        Check your email - we've sent you a summary of your first leads!
                      </p>
                    </div>
                  </div>

                  <p className={`text-orange-400 text-sm ${inter.className}`}>
                    Redirecting to dashboard in a few seconds...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
              <p className={`text-red-400 text-sm ${inter.className}`}>
                {error}
              </p>
            </div>
          )}

          {/* Navigation */}
          {!isSearching && !searchComplete && (
            <div className="flex items-center justify-between mt-12">
              <Button
                onClick={onBack}
                variant="outline"
                className="inline-flex items-center gap-2 px-6 py-3 border-zinc-700 text-gray-300 hover:bg-zinc-900 hover:text-white font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};