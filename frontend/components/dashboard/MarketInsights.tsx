"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Plus, 
  X, 
  ExternalLink, 
  Calendar, 
  Building, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs'; // Import the useAuth hook

interface MarketInsight {
  id: string;
  discoveredCompetitorName: string;
  sourceUrl: string;
  sourceTextSnippet: string;
  context: string;
  status: 'NEW' | 'VIEWED' | 'ACTIONED' | 'IGNORED';
  discoveredAt: string;
}

interface InsightMetrics {
  totalInsights: number;
  newInsights: number;
  actionedInsights: number;
  ignoredInsights: number;
}

// The component now accepts the activeCampaignId as a prop
interface MarketInsightsPageProps {
    activeCampaignId: string | null;
}

export default function MarketInsightsPage({ activeCampaignId }: MarketInsightsPageProps) {
  const { getToken } = useAuth(); // Use the Clerk hook
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingInsight, setProcessingInsight] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<InsightMetrics>({
    totalInsights: 0,
    newInsights: 0,
    actionedInsights: 0,
    ignoredInsights: 0
  });

  const fetchInsights = useCallback(async () => {
    if (!activeCampaignId) return;

    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await api.getMarketInsights(activeCampaignId, token);
      setInsights(response.data || []);
      
      const total = response.data?.length || 0;
      const newCount = response.data?.filter((i: MarketInsight) => i.status === 'NEW').length || 0;
      const actionedCount = response.data?.filter((i: MarketInsight) => i.status === 'ACTIONED').length || 0;
      const ignoredCount = response.data?.filter((i: MarketInsight) => i.status === 'IGNORED').length || 0;
      
      setMetrics({
        totalInsights: total,
        newInsights: newCount,
        actionedInsights: actionedCount,
        ignoredInsights: ignoredCount
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeCampaignId, getToken]);

  const addCompetitor = async (insightId: string) => {
    setProcessingInsight(insightId);
    try {
      const token = await getToken();
      await api.addCompetitorToCampaign(insightId, token);
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: 'ACTIONED' as const }
          : insight
      ));
      setMetrics(prev => ({
        ...prev,
        newInsights: prev.newInsights - 1,
        actionedInsights: prev.actionedInsights + 1
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingInsight(null);
    }
  };

  const updateInsightStatus = async (insightId: string, status: MarketInsight['status']) => {
    setProcessingInsight(insightId);
    try {
      const token = await getToken();
      await api.updateInsightStatus(insightId, status, token);
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, status } : insight
      ));
      
      const insight = insights.find(i => i.id === insightId);
      if (insight?.status === 'NEW') {
        setMetrics(prev => ({
          ...prev,
          newInsights: prev.newInsights - 1,
          [status === 'IGNORED' ? 'ignoredInsights' : 'actionedInsights']: 
            prev[status === 'IGNORED' ? 'ignoredInsights' : 'actionedInsights'] + 1
        }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingInsight(null);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#ff4500] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading market insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Intelligence</h1>
          <p className="text-gray-400">
            Discover new competitors mentioned in your target conversations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Insights" value={metrics.totalInsights} icon={TrendingUp} color="blue" />
            <MetricCard title="New Discoveries" value={metrics.newInsights} icon={Eye} color="orange" />
            <MetricCard title="Added to Campaign" value={metrics.actionedInsights} icon={CheckCircle} color="green" />
            <MetricCard title="Ignored" value={metrics.ignoredInsights} icon={X} color="gray" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {insights.length === 0 ? (
          <div className="text-center py-24">
            <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No insights yet</h3>
            <p className="text-gray-400">
              Our AI will analyze your leads to discover new competitors automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAddCompetitor={() => addCompetitor(insight.id)}
                  onUpdateStatus={(status) => updateInsightStatus(insight.id, status)}
                  isProcessing={processingInsight === insight.id}
                  getTimeAgo={getTimeAgo}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ... (MetricCard and InsightCard components remain the same)
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'orange' | 'green' | 'gray';
}

const MetricCard = ({ title, value, icon: Icon, color }: MetricCardProps) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    orange: 'bg-orange-500/10 text-orange-400',
    green: 'bg-green-500/10 text-green-400',
    gray: 'bg-gray-500/10 text-gray-400'
  };

  return (
    <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#343536]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );
};

interface InsightCardProps {
  insight: MarketInsight;
  onAddCompetitor: () => void;
  onUpdateStatus: (status: MarketInsight['status']) => void;
  isProcessing: boolean;
  getTimeAgo: (date: string) => string;
}

const InsightCard = ({ insight, onAddCompetitor, onUpdateStatus, isProcessing, getTimeAgo }: InsightCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-orange-500/10 text-orange-400';
      case 'ACTIONED': return 'bg-green-500/10 text-green-400';
      case 'IGNORED': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-blue-500/10 text-blue-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#1a1a1b] rounded-lg border border-[#343536] overflow-hidden hover:border-[#ff4500] transition-colors"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff4500]/10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-[#ff4500]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{insight.discoveredCompetitorName}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Discovered {getTimeAgo(insight.discoveredAt)}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(insight.status)}`}>
            {insight.status}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            {insight.sourceTextSnippet}
          </p>
        </div>

        <div className="mb-6">
          <a 
            href={insight.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#ff4500] hover:text-[#ff6b35] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Source
          </a>
        </div>

        {insight.status === 'NEW' && (
          <div className="flex items-center gap-3 pt-4 border-t border-[#343536]">
            <button
              onClick={onAddCompetitor}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors disabled:opacity-50 text-sm"
            >
              {isProcessing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add to Campaign
            </button>
            
            <button
              onClick={() => onUpdateStatus('IGNORED')}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#343536] rounded-lg transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Ignore
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};