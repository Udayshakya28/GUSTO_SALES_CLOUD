"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import PulsatingDotsLoaderReplies from '../loading/LoadingReplies';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900']
});

interface ReplyPerformance {
  id: string;
  content: string;
  upvotes: number;
  authorReplied: boolean;
  postedAt: string;
  redditUrl: string;
  lead: {
    id: string;
    title: string;
    subreddit: string;
    url: string;
    author: string;
  };
}

interface PerformanceMetrics {
  totalReplies: number;
  totalUpvotes: number;
  averageUpvotes: number;
  responseRate: number;
  repliesWithAuthorResponse: number;
}

// Placeholder data for when backend is unavailable
const placeholderReplies: ReplyPerformance[] = [
  {
    id: '1',
    content: 'Great question! I actually built something similar for my SaaS startup. The key is focusing on user experience first, then scaling the backend. I wrote about this in detail on my blog if you\'re interested.',
    upvotes: 15,
    authorReplied: true,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    redditUrl: 'https://reddit.com/r/startup/comments/example1',
    lead: {
      id: '1',
      title: 'How do I scale my SaaS backend without breaking the bank?',
      subreddit: 'startups',
      url: 'https://reddit.com/r/startups/comments/example1',
      author: 'startup_founder_2024'
    }
  },
  {
    id: '2',
    content: 'I faced the exact same issue with my first startup. What worked for me was implementing a tiered pricing strategy with a generous free tier. This helped us acquire users quickly while still generating revenue from power users.',
    upvotes: 8,
    authorReplied: false,
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    redditUrl: 'https://reddit.com/r/entrepreneur/comments/example2',
    lead: {
      id: '2',
      title: 'Struggling with pricing strategy for my new SaaS',
      subreddit: 'Entrepreneur',
      url: 'https://reddit.com/r/Entrepreneur/comments/example2',
      author: 'indie_hacker_23'
    }
  },
  {
    id: '3',
    content: 'This is a common challenge! I recommend starting with customer interviews before building anything. We saved months of development time by validating our assumptions early. Happy to share our interview template if helpful.',
    upvotes: 23,
    authorReplied: true,
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    redditUrl: 'https://reddit.com/r/saas/comments/example3',
    lead: {
      id: '3',
      title: 'How to validate SaaS idea without spending too much?',
      subreddit: 'SaaS',
      url: 'https://reddit.com/r/SaaS/comments/example3',
      author: 'product_builder'
    }
  }
];

const placeholderMetrics: PerformanceMetrics = {
  totalReplies: 47,
  totalUpvotes: 312,
  averageUpvotes: 6.6,
  responseRate: 68.1,
  repliesWithAuthorResponse: 32
};

export default function PerformancePage() {
  const { getToken } = useAuth();
  const [replies, setReplies] = useState<ReplyPerformance[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalReplies: 0,
    totalUpvotes: 0,
    averageUpvotes: 0,
    responseRate: 0,
    repliesWithAuthorResponse: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);

  const fetchPerformance = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await api.getReplyPerformance(token);
      setReplies(response.data || []);
      setMetrics(response.metrics || {
        totalReplies: 0,
        totalUpvotes: 0,
        averageUpvotes: 0,
        responseRate: 0,
        repliesWithAuthorResponse: 0
      });
      setUsingPlaceholder(false);
    } catch (err: any) {
      console.error('Failed to fetch performance data:', err);
      // Use placeholder data when API fails
      setReplies(placeholderReplies);
      setMetrics(placeholderMetrics);
      setUsingPlaceholder(true);
      setError(null); // Don't show error if we have placeholder data
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getUpvoteColor = (upvotes: number) => {
    if (upvotes >= 10) return 'text-green-400';
    if (upvotes >= 5) return 'text-orange-400';
    if (upvotes >= 1) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <PulsatingDotsLoaderReplies />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      willChange: 'scroll-position'
    }}>
      
      {/* Background Effects - Same as Hero/HowToDo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
    
        {/* Enhanced Spotlight Beam */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] bg-gradient-radial from-orange-400/15 via-orange-300/8 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-orange-300/25 via-orange-200/12 to-transparent rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h1 className={`text-4xl font-black tracking-tight text-white ${poppins.className}`}>
              Reply Performance
            </h1>
            <p className={`text-xl text-zinc-400 font-medium ${inter.className}`}>
              Track the success of your Reddit engagement
            </p>
            {usingPlaceholder && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className={`text-sm text-orange-400 ${inter.className}`}>
                  Demo data - showing example performance metrics
                </span>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <MetricCard 
              title="Total Replies" 
              value={metrics.totalReplies} 
              icon={ChatBubbleLeftIcon} 
              color="blue" 
            />
            <MetricCard 
              title="Total Upvotes" 
              value={metrics.totalUpvotes} 
              icon={ArrowUpIcon} 
              color="green" 
            />
            <MetricCard 
              title="Avg Upvotes" 
              value={metrics.averageUpvotes} 
              icon={ArrowTrendingUpIcon} 
              color="yellow" 
              isDecimal 
            />
            <MetricCard 
              title="Response Rate" 
              value={metrics.responseRate} 
              icon={UsersIcon} 
              color="purple" 
              suffix="%" 
              isDecimal 
            />
            <MetricCard 
              title="Author Replies" 
              value={metrics.repliesWithAuthorResponse} 
              icon={CursorArrowRaysIcon} 
              color="orange" 
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm p-4">
              <div className="flex items-center gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
                <span className={`text-red-400 ${inter.className}`}>{error}</span>
              </div>
            </div>
          )}

          {/* Empty State or Reply List */}
          {replies.length === 0 && !usingPlaceholder ? (
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-24 text-center">
              <ChartBarIcon className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
              <h3 className={`text-xl font-bold text-white mb-2 ${poppins.className}`}>
                No replies yet
              </h3>
              <p className={`text-zinc-400 ${inter.className}`}>
                Start engaging with leads to see your performance metrics here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold text-white ${poppins.className}`}>
                Recent Replies
              </h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {replies.map((reply) => (
                    <ReplyCard
                      key={reply.id}
                      reply={reply}
                      getTimeAgo={getTimeAgo}
                      getUpvoteColor={getUpvoteColor}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  suffix?: string;
  isDecimal?: boolean;
}

const MetricCard = ({ title, value, icon: Icon, color, suffix = '', isDecimal = false }: MetricCardProps) => {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400'
  };

  const displayValue = isDecimal ? value.toFixed(1) : value.toString();

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/60"
    >
      <div className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className={`text-sm font-medium text-zinc-400 ${inter.className}`}>
            {title}
          </h3>
          <div className={`p-2 rounded-lg ${colors[color]} shadow-lg`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className={`text-3xl font-black text-white ${poppins.className}`}>
            {displayValue}{suffix}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ReplyCardProps {
  reply: ReplyPerformance;
  getTimeAgo: (date: string) => string;
  getUpvoteColor: (upvotes: number) => string;
}

const ReplyCard = ({ reply, getTimeAgo, getUpvoteColor }: ReplyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/70 hover:bg-zinc-900/60"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`text-lg font-bold text-white mb-2 group-hover:text-orange-50 transition-colors ${poppins.className}`}>
              {reply.lead.title}
            </h3>
            <div className={`flex items-center gap-3 text-sm text-zinc-400 ${inter.className}`}>
              <div className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-400">
                r/{reply.lead.subreddit}
              </div>
              <span>u/{reply.lead.author}</span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {getTimeAgo(reply.postedAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowUpIcon className={`w-4 h-4 ${getUpvoteColor(reply.upvotes)}`} />
              <span className={`font-bold ${getUpvoteColor(reply.upvotes)} ${inter.className}`}>
                {reply.upvotes}
              </span>
            </div>
            
            {reply.authorReplied && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
                <ChatBubbleLeftIcon className="w-3 h-3 text-green-400" />
                <span className={`text-xs text-green-400 font-medium ${inter.className}`}>
                  Author replied
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className={`text-zinc-300 leading-relaxed ${inter.className}`}>
            {reply.content}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={reply.lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 ${inter.className}`}
          >
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            View Original Post
          </a>
          
          {reply.redditUrl && (
            <a 
              href={reply.redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors ${inter.className}`}
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              View Reply
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
