"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RedditConnection } from '../dashboard/RedditSettings';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useUser } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface Props {
  onBack: () => void;
  onNext: () => void;
  error: string | null;
}

export const Step2_ConnectReddit: React.FC<Props> = ({
  onBack,
  onNext,
  error
}) => {
  const { user, isLoaded } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Check if Reddit is already connected
  useEffect(() => {
    if (isLoaded && user) {
      const connected = !!user.publicMetadata?.redditRefreshToken;
      setIsConnected(connected);
    }
  }, [isLoaded, user]);

  // Periodically check for connection (for when user returns from Reddit OAuth)
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(async () => {
        if (user) {
          setCheckingConnection(true);
          await user.reload();
          const connected = !!user.publicMetadata?.redditRefreshToken;
          if (connected) {
            setIsConnected(true);
            setCheckingConnection(false);
            clearInterval(interval);
          }
          setCheckingConnection(false);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected, user]);

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
          Step 2 of 3
        </Badge>
        
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6 ${poppins.className}`}>
          Connect Your{" "}
          <span className="text-orange-500">
            Reddit Account
          </span>
        </h1>
        
        <p className={`text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
          We need access to your Reddit account to search for leads and post replies on your behalf.
        </p>
      </div>

      {/* Main Content Card */}
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-300">
        <CardContent className="p-8 sm:p-12">
          {!isConnected ? (
            <div className="space-y-8">
              {/* Connection Status */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </div>
                
                <h3 className={`text-2xl font-bold text-white ${poppins.className}`}>
                  Reddit Connection Required
                </h3>
                
                <p className={`text-gray-400 ${inter.className}`}>
                  {checkingConnection 
                    ? "Checking connection status..." 
                    : "Connect your Reddit account to proceed with lead discovery"
                  }
                </p>
              </div>

              {/* Reddit Connection Component */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <RedditConnection onConnectionChange={setIsConnected} />
                </div>
              </div>

              {/* Why We Need This */}
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-6">
                <h4 className={`text-lg font-semibold text-white mb-3 ${poppins.className}`}>
                  Why do we need your Reddit account?
                </h4>
                <ul className={`space-y-2 text-gray-400 text-sm ${inter.className}`}>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Search for leads using your account's permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Post replies and engage with potential customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Ensure compliance with Reddit's terms of service</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className={`text-red-400 text-sm ${inter.className}`}>
                    {error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Connected State */
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
              
              <div>
                <h3 className={`text-2xl font-bold text-white mb-2 ${poppins.className}`}>
                  Reddit Connected Successfully!
                </h3>
                <p className={`text-gray-400 ${inter.className}`}>
                  Your Reddit account is now connected. Ready to find your first leads?
                </p>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
                <p className={`text-green-400 text-sm ${inter.className}`}>
                  Connected as u/{String(user?.publicMetadata?.redditUsername ?? "")}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <Button
              onClick={onBack}
              variant="outline"
              className="inline-flex items-center gap-2 px-6 py-3 border-zinc-700 text-gray-300 hover:bg-zinc-900 hover:text-white font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={onNext}
              disabled={!isConnected}
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};