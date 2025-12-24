"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadCard } from './LeadCard';
import { 
  RefreshCw, 
  Inbox, 
  Send, 
  Bookmark, 
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';
import LoadingLeads from '../loading/LoadingLeads';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

// The Lead interface should include the isGoogleRanked property
interface Lead {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  body: string;
  createdAt: number;
  numComments: number;
  upvoteRatio: number;
  intent: string;
  summary?: string | null;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
  isGoogleRanked?: boolean; // Add this property
}

interface LeadFeedProps {
  leads: Lead[];
  onManualDiscovery: () => void;
  isRunningDiscovery: boolean;
  onLeadUpdate: (leadId: string, status: Lead['status']) => void;
  isLoading?: boolean;
  activeFilter: string;
  onDelete: (leadId: string) => void;

}

type SortOption = 'createdAt' | 'opportunityScore' | 'numComments' | 'upvoteRatio';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  intent: string[];
  subreddit: string[];
  minOpportunityScore: number;
  minComments: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const emptyStateMessages = {
  new: {
    icon: Inbox,
    title: "No new leads",
    message: "Your inbox is clear. Run a discovery to find new leads.",
  },
  replied: {
    icon: Send,
    title: "No replied leads",
    message: "You haven't replied to any leads yet. Engage with a new lead!",
  },
  saved: {
    icon: Bookmark,
    title: "No saved leads",
    message: "You haven't saved any leads. Save interesting leads for later.",
  },
  all: {
    icon: Inbox,
    title: "No leads found",
    message: "Run a discovery to start finding leads for your campaign.",
  },
};

const sortOptions = [
  { value: 'createdAt', label: 'Latest First', icon: '🕒' },
  { value: 'opportunityScore', label: 'Opportunity Score', icon: '🎯' },
  { value: 'numComments', label: 'Most Comments', icon: '💬' },
  { value: 'upvoteRatio', label: 'Upvote Ratio', icon: '⬆️' },
];

const intentOptions = [
  { value: 'solution_seeking', label: 'Solution Seeking', color: 'bg-green-500/10 text-green-400' },
  { value: 'pain_point', label: 'Pain Point', color: 'bg-red-500/10 text-red-400' },
  { value: 'brand_comparison', label: 'Brand Comparison', color: 'bg-blue-500/10 text-blue-400' },
];

export const LeadFeed: React.FC<LeadFeedProps> = ({ 
  leads, 
  onManualDiscovery, 
  isRunningDiscovery,
  onLeadUpdate,
  isLoading = false,
  onDelete,
  activeFilter 
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<FilterState>({
    intent: [],
    subreddit: [],
    minOpportunityScore: 0,
    minComments: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique subreddits from leads
  const availableSubreddits = useMemo(() => {
    const subreddits = [...new Set(leads.map(lead => lead.subreddit))].sort();
    return subreddits;
  }, [leads]);

  // Apply sorting and filtering
  const processedLeads = useMemo(() => {
    let filtered = [...leads];

    // Apply filters
    if (filters.intent.length > 0) {
      filtered = filtered.filter(lead => filters.intent.includes(lead.intent));
    }

    if (filters.subreddit.length > 0) {
      filtered = filtered.filter(lead => filters.subreddit.includes(lead.subreddit));
    }

    if (filters.minOpportunityScore > 0) {
      filtered = filtered.filter(lead => lead.opportunityScore >= filters.minOpportunityScore);
    }

    if (filters.minComments > 0) {
      filtered = filtered.filter(lead => lead.numComments >= filters.minComments);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, filters, sortBy, sortOrder]);

  const toggleIntentFilter = (intent: string) => {
    setFilters(prev => ({
      ...prev,
      intent: prev.intent.includes(intent)
        ? prev.intent.filter(i => i !== intent)
        : [...prev.intent, intent]
    }));
  };

  const toggleSubredditFilter = (subreddit: string) => {
    setFilters(prev => ({
      ...prev,
      subreddit: prev.subreddit.includes(subreddit)
        ? prev.subreddit.filter(s => s !== subreddit)
        : [...prev.subreddit, subreddit]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      intent: [],
      subreddit: [],
      minOpportunityScore: 0,
      minComments: 0,
    });
  };

  const activeFiltersCount = 
    filters.intent.length + 
    filters.subreddit.length + 
    (filters.minOpportunityScore > 0 ? 1 : 0) + 
    (filters.minComments > 0 ? 1 : 0);

  if (isLoading) {
    return <LoadingLeads />;
  }

  // Show empty state
  if (leads.length === 0) {
    const { icon: Icon, title, message } = emptyStateMessages[activeFilter as keyof typeof emptyStateMessages] || emptyStateMessages.all;

    return (
      <div className="min-h-screen bg-black">
        <div className="text-center py-20">
          <Icon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>
            {title}
          </h3>
          <p className={`text-gray-400 mt-2 ${inter.className}`}>
            {message}
          </p>
          <button
            onClick={onManualDiscovery}
            disabled={isRunningDiscovery}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningDiscovery ? 'animate-spin' : ''}`} />
            {isRunningDiscovery ? 'Discovering...' : 'Run Discovery'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Controls Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Results Count */}
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-bold text-white ${poppins.className}`}>
              {processedLeads.length} Lead{processedLeads.length !== 1 ? 's' : ''}
            </h2>
            {processedLeads.length !== leads.length && (
              <Badge variant="outline" className="text-orange-400 border-orange-500/20">
                {leads.length - processedLeads.length} filtered out
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <span className={inter.className}>
                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-black border-white/10 min-w-[200px]"
              >
                <DropdownMenuLabel className={`text-white ${inter.className}`}>
                  Sort by
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      if (sortBy === option.value) {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy(option.value as SortOption);
                        setSortOrder('desc');
                      }
                    }}
                    className="text-white hover:bg-white/10 cursor-pointer"
                  >
                    <span className="mr-2">{option.icon}</span>
                    <span className={inter.className}>{option.label}</span>
                    {sortBy === option.value && (
                      <span className="ml-auto text-orange-400">
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Toggle */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 ${
                activeFiltersCount > 0 ? 'border-orange-500/30 bg-orange-500/10' : ''
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className={inter.className}>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-orange-500 text-white text-xs h-5 px-1.5"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllFilters}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-1" />
                <span className={inter.className}>Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Intent Filter */}
                <div>
                  <label className={`text-sm font-medium text-white mb-2 block ${inter.className}`}>
                    Intent
                  </label>
                  <div className="space-y-2">
                    {intentOptions.map((intent) => (
                      <Button
                        key={intent.value}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleIntentFilter(intent.value)}
                        className={`w-full justify-start text-left ${
                          filters.intent.includes(intent.value)
                            ? `${intent.color} border-current`
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className={inter.className}>{intent.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Subreddit Filter */}
                <div>
                  <label className={`text-sm font-medium text-white mb-2 block ${inter.className}`}>
                    Subreddit
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableSubreddits.slice(0, 5).map((subreddit) => (
                      <Button
                        key={subreddit}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSubredditFilter(subreddit)}
                        className={`w-full justify-start text-left ${
                          filters.subreddit.includes(subreddit)
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className={inter.className}>r/{subreddit}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Opportunity Score Filter */}
                <div>
                  <label className={`text-sm font-medium text-white mb-2 block ${inter.className}`}>
                    Min Opportunity Score
                  </label>
                  <div className="space-y-2">
                    {[0, 40, 60, 80].map((score) => (
                      <Button
                        key={score}
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, minOpportunityScore: score }))}
                        className={`w-full justify-start ${
                          filters.minOpportunityScore === score
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className={inter.className}>
                          {score === 0 ? 'Any' : `${score}%+`}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Comments Filter */}
                <div>
                  <label className={`text-sm font-medium text-white mb-2 block ${inter.className}`}>
                    Min Comments
                  </label>
                  <div className="space-y-2">
                    {[0, 5, 10, 20].map((count) => (
                      <Button
                        key={count}
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, minComments: count }))}
                        className={`w-full justify-start ${
                          filters.minComments === count
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className={inter.className}>
                          {count === 0 ? 'Any' : `${count}+`}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Leads List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-4"
      >
        <AnimatePresence>
          {processedLeads.map(lead => (
            <LeadCard 
              key={lead.id} 
              onDelete={onDelete}
              lead={lead} 
              onStatusChange={onLeadUpdate} 
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results After Filtering */}
      {processedLeads.length === 0 && leads.length > 0 && (
        <div className="text-center py-20">
          <SlidersHorizontal className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>
            No leads match your filters
          </h3>
          <p className={`text-gray-400 mt-2 mb-6 ${inter.className}`}>
            Try adjusting your filter criteria to see more results
          </p>
          <Button 
            onClick={clearAllFilters}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <span className={inter.className}>Clear All Filters</span>
          </Button>
        </div>
      )}
    </div>
  );
};
