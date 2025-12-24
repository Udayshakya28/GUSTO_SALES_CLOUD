"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { toast } from 'sonner';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface DiscoveryButtonsProps {
  campaignId: string;
  targetSubreddits: string[];
  onLeadsDiscovered: () => void;
  lastDiscoveryAt: Date | null;
  lastGlobalDiscoveryAt?: Date | null;
  lastTargetedDiscoveryAt?: Date | null;
}

interface ApiResponse {
  length?: number;
  leads?: unknown[];
  subredditsSearched?: string[];
  message?: string;
}

export const DiscoveryButtons: React.FC<DiscoveryButtonsProps> = ({
  campaignId,
  targetSubreddits,
  onLeadsDiscovered,
  lastDiscoveryAt,
  lastGlobalDiscoveryAt,
  lastTargetedDiscoveryAt
}) => {
  const { getToken } = useAuth();
  const [isRunningGlobal, setIsRunningGlobal] = useState<boolean>(false);
  const [isRunningTargeted, setIsRunningTargeted] = useState<boolean>(false);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number | null>(null);
  const [targetedTimeLeft, setTargetedTimeLeft] = useState<number | null>(null);

  const COOLDOWN_HOURS = 10;
  const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

  // Calculate time remaining for cooldowns
  const calculateTimeLeft = useCallback((lastRunAt: Date | null): number | null => {
    if (!lastRunAt) return null;
    
    try {
      const now = new Date().getTime();
      const lastRun = new Date(lastRunAt).getTime();
      
      // Check if dates are valid
      if (isNaN(now) || isNaN(lastRun)) return null;
      
      const timePassed = now - lastRun;
      const timeLeft = COOLDOWN_MS - timePassed;
      
      return timeLeft > 0 ? timeLeft : null;
    } catch (error) {
      console.error('Error calculating time left:', error);
      return null;
    }
  }, [COOLDOWN_MS]);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalTimeLeft(calculateTimeLeft(lastGlobalDiscoveryAt || null));
      setTargetedTimeLeft(calculateTimeLeft(lastTargetedDiscoveryAt || null));
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, lastGlobalDiscoveryAt, lastTargetedDiscoveryAt]);

  // Initialize timers on mount
  useEffect(() => {
    setGlobalTimeLeft(calculateTimeLeft(lastGlobalDiscoveryAt || null));
    setTargetedTimeLeft(calculateTimeLeft(lastTargetedDiscoveryAt || null));
  }, [calculateTimeLeft, lastGlobalDiscoveryAt, lastTargetedDiscoveryAt]);

  // Format time remaining
  const formatTimeLeft = (timeMs: number): string => {
    try {
      const hours = Math.floor(timeMs / (60 * 60 * 1000));
      const minutes = Math.floor((timeMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((timeMs % (60 * 1000)) / 1000);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return '0s';
    }
  };

  const handleGlobalDiscovery = async (): Promise<void> => {
    if (globalTimeLeft && globalTimeLeft > 0) {
      toast.error('Global search is on cooldown', {
        description: `Please wait ${formatTimeLeft(globalTimeLeft)} before running again`
      });
      return;
    }

    try {
      setIsRunningGlobal(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }

      const result = await api.runManualDiscovery(campaignId, token) as ApiResponse;

      const leadCount = Array.isArray(result) ? result.length : (result?.length || 0);
      
      toast.success(`Found ${leadCount} global leads!`, {
        description: 'Discovered leads from across Reddit using global search'
      });

      onLeadsDiscovered();
    } catch (error: unknown) {
      console.error('Global discovery failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error('Global discovery failed', {
        description: errorMessage || 'Please try again later'
      });
    } finally {
      setIsRunningGlobal(false);
    }
  };

  const handleTargetedDiscovery = async (): Promise<void> => {
    if (targetedTimeLeft && targetedTimeLeft > 0) {
      toast.error('Targeted search is on cooldown', {
        description: `Please wait ${formatTimeLeft(targetedTimeLeft)} before running again`
      });
      return;
    }

    try {
      setIsRunningTargeted(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }

      const result = await api.runTargetedDiscovery(campaignId, token) as ApiResponse;

      const leadCount = result?.leads?.length || 0;
      const subredditCount = result?.subredditsSearched?.length || 0;

      toast.success(`Found ${leadCount} targeted leads!`, {
        description: `Searched ${subredditCount} specific subreddits`
      });

      onLeadsDiscovered();
    } catch (error: unknown) {
      console.error('Targeted discovery failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('No target subreddits')) {
        toast.error('No target subreddits configured', {
          description: 'Please add target subreddits to your campaign first'
        });
      } else {
        toast.error('Targeted discovery failed', {
          description: errorMessage || 'Please try again later'
        });
      }
    } finally {
      setIsRunningTargeted(false);
    }
  };

  const isAnyRunning = isRunningGlobal || isRunningTargeted;
  const hasTargetSubreddits = targetSubreddits && targetSubreddits.length > 0;
  const isGlobalOnCooldown = globalTimeLeft !== null && globalTimeLeft > 0;
  const isTargetedOnCooldown = targetedTimeLeft !== null && targetedTimeLeft > 0;

  return (
    <div className="space-y-6">
      {/* Discovery Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      >
        {/* Global Discovery */}
        <motion.div
          whileHover={!isGlobalOnCooldown ? { scale: 1.02 } : {}}
          whileTap={!isGlobalOnCooldown ? { scale: 0.98 } : {}}
          className="group relative h-full flex flex-col"
        >
          <div className={`bg-black/40 backdrop-blur-sm border rounded-lg p-3 sm:p-4 flex flex-col h-full min-h-[210px] transition-all duration-300 ${
            isGlobalOnCooldown ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'
          }`}>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-base sm:text-lg font-bold text-white ${poppins.className}`}>
                  Global Search
                </h3>
                {isGlobalOnCooldown && globalTimeLeft !== null && (
                  <div className="flex items-center gap-1 text-red-400">
                    <Clock className="w-4 h-4" />
                    <span className={`text-xs font-medium ${inter.className}`}>
                      {formatTimeLeft(globalTimeLeft)}
                    </span>
                  </div>
                )}
              </div>
              <p className={`text-white/60 text-sm ${inter.className}`}>
                {isGlobalOnCooldown && globalTimeLeft !== null
                  ? `Global search is on cooldown. Next search available in ${formatTimeLeft(globalTimeLeft)}.`
                  : 'AI-powered search across the entire Reddit platform for discovering new opportunities.'
                }
              </p>
            </div>
            <Button
              onClick={handleGlobalDiscovery}
              disabled={isAnyRunning || isGlobalOnCooldown}
              className={`w-full border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base rounded-md ${
                isGlobalOnCooldown 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/20' 
                  : 'bg-white text-blue-600 hover:bg-gray-50'
              }`}
            >
              {isRunningGlobal ? (
                <span className={poppins.className}>Discovering Globally...</span>
              ) : isGlobalOnCooldown ? (
                <span className={poppins.className}>On Cooldown</span>
              ) : (
                <span className={poppins.className}>Start Global Discovery</span>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Targeted Discovery */}
        <motion.div
          whileHover={!isTargetedOnCooldown && hasTargetSubreddits ? { scale: 1.02 } : {}}
          whileTap={!isTargetedOnCooldown && hasTargetSubreddits ? { scale: 0.98 } : {}}
          className="group relative h-full flex flex-col"
        >
          <div className={`bg-black/40 backdrop-blur-sm border rounded-lg p-3 sm:p-4 flex flex-col h-full min-h-[210px] transition-all duration-300 ${
            isTargetedOnCooldown ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'
          }`}>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-base sm:text-lg font-bold text-white ${poppins.className}`}>
                  Targeted Search
                </h3>
                {isTargetedOnCooldown && targetedTimeLeft !== null && (
                  <div className="flex items-center gap-1 text-red-400">
                    <Clock className="w-4 h-4" />
                    <span className={`text-xs font-medium ${inter.className}`}>
                      {formatTimeLeft(targetedTimeLeft)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <p className={`text-white/60 text-sm ${inter.className}`}>
                {isTargetedOnCooldown && targetedTimeLeft !== null
                  ? `Targeted search is on cooldown. Next search available in ${formatTimeLeft(targetedTimeLeft)}.`
                  : hasTargetSubreddits 
                    ? `Deep search across your ${targetSubreddits.length} configured subreddits for highly relevant leads.`
                    : 'Configure target subreddits in your campaign settings to unlock precision targeting.'
                }
              </p>
            </div>
            <Button
              onClick={handleTargetedDiscovery}
              disabled={isAnyRunning || !hasTargetSubreddits || isTargetedOnCooldown}
              className={`w-full border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base rounded-md ${
                isTargetedOnCooldown 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/20'
                  : 'bg-white text-red-600 hover:bg-gray-50'
              }`}
            >
              {isRunningTargeted ? (
                <span className={poppins.className}>Targeting Leads...</span>
              ) : isTargetedOnCooldown ? (
                <span className={poppins.className}>On Cooldown</span>
              ) : !hasTargetSubreddits ? (
                <span className={poppins.className}>Configure Subreddits</span>
              ) : (
                <span className={poppins.className}>Start Targeted Search</span>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Progress Indicator */}
      {isAnyRunning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              animate={{
                width: ['0%', '100%'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <p className={`text-center text-white/60 text-sm ${inter.className}`}>
            {isRunningGlobal 
              ? 'Scanning Reddit globally for opportunities...' 
              : 'Analyzing targeted subreddits for leads...'
            }
          </p>
        </motion.div>
      )}

      {/* Last Discovery Info */}
      {lastDiscoveryAt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className={`text-white/50 text-sm ${inter.className}`}>
            Last discovery: {new Date(lastDiscoveryAt).toLocaleDateString()}
          </p>
        </motion.div>
      )}
    </div>
  );
};