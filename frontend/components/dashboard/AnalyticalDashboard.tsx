"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UsersIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  BoltIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  XMarkIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, Poppins } from 'next/font/google';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import LoadingLeads from '../loading/LoadingLeads';
import PulsatingDotsLoaderDashboard from '../loading/LoadingDashboard';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface Campaign {
  id: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  targetSubreddits: string[];
  createdAt: string;
}

interface Lead {
  id: string;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
  createdAt: number;
  subreddit: string;
  numComments: number;
  upvoteRatio: number;
}

interface AnalyticsData {
  trends: Array<{ date: string; leads: number }>;
  subredditPerformance: Array<{ name: string; leads: number; color: string }>;
  metrics: {
    totalLeadsChange: string;
    totalLeadsDescription: string;
    totalLeadsTrend: 'up' | 'down' | 'steady';
    newLeadsChange: string;
    newLeadsDescription: string;
    newLeadsTrend: 'up' | 'down' | 'steady';
    conversionChange: string;
    conversionDescription: string;
    conversionTrend: 'up' | 'down' | 'steady';
    opportunityChange: string;
    opportunityDescription: string;
    opportunityTrend: 'up' | 'down' | 'steady';
  };
  opportunityDistribution: Array<{ name: string; value: number; color: string }>;
  weeklyActivity: Array<{ day: string; activity: number }>;
}

interface Props {
  campaigns: Campaign[];
  activeCampaign: string | null;
  leadStats: { new: number; replied: number; saved: number; all: number };
  allLeads: Lead[];
}

export const AnalyticalDashboard = ({ campaigns, activeCampaign, leadStats, allLeads }: Props) => {
  const { getToken } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllSubreddits, setShowAllSubreddits] = useState(false);

  // Fallback calculations for when backend data isn't available
  const conversionRate = leadStats.all > 0 
    ? ((leadStats.replied / leadStats.all) * 100).toFixed(1)
    : "0.0";

  const activeCampaignData = campaigns.find(c => c.id === activeCampaign);

  const avgOpportunityScore = allLeads.length > 0 
    ? Math.min(10, Math.max(0, (allLeads.reduce((sum, lead) => sum + lead.opportunityScore, 0) / allLeads.length) / 10)).toFixed(1)
    : "0.0";

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!activeCampaign) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = await getToken();
        
        const [trendsResponse, performanceResponse, metricsResponse, opportunityResponse, activityResponse] = await Promise.all([
          api.getLeadTrends(activeCampaign, token),
          api.getSubredditPerformance(activeCampaign, token),
          api.getAnalyticsMetrics(activeCampaign, token),
          api.getOpportunityDistribution(activeCampaign, token),
          api.getWeeklyActivity(activeCampaign, token)
        ]);
        
        console.log('🔍 Full Performance Response:', performanceResponse);
        console.log('📊 Performance Response Data:', performanceResponse.data);
        console.log('📈 Performance Response Structure:', JSON.stringify(performanceResponse, null, 2));
        
        // FIXED: Better data handling
        let transformedSubredditData = [];
        
        if (performanceResponse.data && Array.isArray(performanceResponse.data)) {
          const palette = ['#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ffb347', '#ffc266', '#ffd285', '#ffe4a3'];
          
          transformedSubredditData = performanceResponse.data.map((item: any, idx: number) => {
            console.log('🔧 Processing item:', item);
            
            // Handle both possible response formats
            const subredditName = item.name || item.subreddit || 'Unknown';
            const leadCount = item.leads || item._count?.id || 0;
            
            console.log(`🎯 Transformed: ${subredditName} -> ${leadCount} leads`);
            
            return {
              name: subredditName,
              leads: leadCount,
              color: palette[idx % palette.length]
            };
          }).filter((item: any) => item.name && item.name !== 'Unknown' && item.leads > 0);
        }
        
        console.log('✅ Final transformed data:', transformedSubredditData);
        
        setAnalyticsData({
          trends: trendsResponse.data || [],
          subredditPerformance: transformedSubredditData,
          metrics: metricsResponse.data || {
            totalLeadsChange: "+0%",
            totalLeadsDescription: "No data available",
            totalLeadsTrend: "steady",
            newLeadsChange: "+0%",
            newLeadsDescription: "No data available",
            newLeadsTrend: "steady",
            conversionChange: "+0%",
            conversionDescription: "No data available",
            conversionTrend: "steady",
            opportunityChange: "+0.0",
            opportunityDescription: "No data available",
            opportunityTrend: "steady"
          },
          // 🎨 UPDATED: Orange tinted pie chart colors
          opportunityDistribution: opportunityResponse.data || [
            { name: 'High', value: 0, color: '#ff4500' },    // Bright Reddit orange
            { name: 'Medium', value: 0, color: '#ff6a00' },  // Medium orange
            { name: 'Low', value: 0, color: '#cc3700' }      // Darker orange
          ],
          weeklyActivity: activityResponse.data || []
        });
      } catch (error) {
        console.error('❌ Failed to fetch analytics:', error);
        // Set fallback data on error with orange theme
        setAnalyticsData({
          trends: [],
          subredditPerformance: [],
          metrics: {
            totalLeadsChange: "+0%",
            totalLeadsDescription: "Unable to load data",
            totalLeadsTrend: "steady",
            newLeadsChange: "+0%",
            newLeadsDescription: "Unable to load data",
            newLeadsTrend: "steady",
            conversionChange: "+0%",
            conversionDescription: "Unable to load data",
            conversionTrend: "steady",
            opportunityChange: "+0.0",
            opportunityDescription: "Unable to load data",
            opportunityTrend: "steady"
          },
          // 🎨 UPDATED: Orange tinted fallback colors
          opportunityDistribution: [
            { name: 'High', value: 0, color: '#ff4500' },    // Bright Reddit orange
            { name: 'Medium', value: 0, color: '#ff6a00' },  // Medium orange
            { name: 'Low', value: 0, color: '#cc3700' }      // Darker orange
          ],
          weeklyActivity: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeCampaign, getToken]);

  const MetricCard = ({ title, value, change, description, icon: Icon, trend, isOrange = false }: any) => (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-3">
              <p className={`text-sm font-medium text-gray-400 ${inter.className}`}>
                {title}
              </p>
              <div>
                <div className={`text-2xl font-bold text-white ${poppins.className}`}>
                  {value}
                </div>
                <div className="flex items-center mt-2">
                  {trend === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : trend === 'down' ? (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <ChartBarIcon className="h-4 w-4 text-orange-500 mr-1" />
                  )}
                  <p className={`text-xs ${
                    trend === 'up' 
                      ? 'text-green-500' 
                      : trend === 'down' 
                        ? 'text-red-500' 
                        : 'text-orange-500'
                  } ${inter.className}`}>
                    {change}
                  </p>
                  <p className={`text-xs text-gray-500 ml-2 ${inter.className}`}>
                    {description}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-4 w-4">
              <Icon className={`h-4 w-4 ${isOrange ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const SubredditLeaderboard = ({ data, showAll = false }: { data: Array<{ name: string; leads: number; color: string }>, showAll?: boolean }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[280px] text-gray-400">
          <div className="text-center">
            <TrophyIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className={`text-sm ${inter.className}`}>No subreddit data available</p>
            <p className={`text-xs text-gray-500 mt-1 ${inter.className}`}>Discovery will populate this leaderboard</p>
          </div>
        </div>
      );
    }

    const getRankIcon = (index: number) => {
      if (index === 0) return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      if (index === 1) return <TrophyIcon className="h-5 w-5 text-gray-400" />;
      if (index === 2) return <TrophyIcon className="h-5 w-5 text-amber-600" />;
      return <FireIcon className="h-5 w-5 text-orange-500" />;
    };

    const displayData = showAll ? data : data.slice(0, 5);

    return (
      <div className="space-y-3">
        {displayData.map((subreddit, index) => (
          <motion.div
            key={`${subreddit.name}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800">
                {getRankIcon(showAll ? index : index)}
              </div>
              <div>
                <p className={`text-sm font-medium text-white ${poppins.className}`}>
                  r/{subreddit.name}
                </p>
                <p className={`text-xs text-gray-400 ${inter.className}`}>
                  #{(showAll ? index : index) + 1} • Community
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`text-lg font-bold text-white ${poppins.className}`}>
                  {subreddit.leads}
                </p>
                <p className={`text-xs text-gray-400 ${inter.className}`}>
                  leads
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="w-16 bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (subreddit.leads / Math.max(data[0]?.leads || 1, 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
        
        {!showAll && data.length > 5 && (
          <div className="text-center pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAllSubreddits(true)}
              className="text-orange-400 border-orange-500/20 hover:bg-orange-500/10"
            >
              View All {data.length} Communities
            </Button>
          </div>
        )}
      </div>
    );
  };

  // All Communities Modal Component
  const AllCommunitiesModal = () => (
    <AnimatePresence>
      {showAllSubreddits && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllSubreddits(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h2 className={`text-xl font-bold text-white ${poppins.className}`}>
                  All Communities
                </h2>
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  Complete performance leaderboard
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSubreddits(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <SubredditLeaderboard 
                data={analyticsData?.subredditPerformance || []} 
                showAll={true} 
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
         <PulsatingDotsLoaderDashboard/>
          <p className={`text-gray-400 text-sm ${inter.className}`}>
            Hang on! We're fetching your dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black">
        <div className="p-8 space-y-8">
          {/* Header with Campaign Name */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className={`text-3xl font-bold text-white ${poppins.className}`}>
                Dashboard
              </h1>
              <p className={`text-gray-400 ${inter.className}`}>
                Lead generation insights and performance metrics
              </p>
            </div>
            
            {/* Campaign Info with proper spacing */}
            {activeCampaignData && (
              <div className="flex items-center gap-4 ml-12">
                <div className="w-1 h-12 bg-orange-500 rounded-full"></div>
                <div>
                  <p className={`text-sm font-medium text-orange-500 ${inter.className}`}>
                    Active Campaign
                  </p>
                  <p className={`text-lg font-semibold text-white ${poppins.className}`}>
                    {new URL(activeCampaignData.analyzedUrl).hostname}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Leads"
              value={leadStats.all}
              change={analyticsData?.metrics?.totalLeadsChange || "+0%"}
              description={analyticsData?.metrics?.totalLeadsDescription || "No data"}
              icon={UsersIcon}
              trend={analyticsData?.metrics?.totalLeadsTrend || "steady"}
            />
            <MetricCard
              title="New Leads"
              value={leadStats.new}
              change={analyticsData?.metrics?.newLeadsChange || "+0%"}
              description={analyticsData?.metrics?.newLeadsDescription || "No data"}
              icon={BoltIcon}
              trend={analyticsData?.metrics?.newLeadsTrend || "steady"}
              isOrange={true}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              change={analyticsData?.metrics?.conversionChange || "+0%"}
              description={analyticsData?.metrics?.conversionDescription || "No data"}
              icon={ArrowTrendingUpIcon}
              trend={analyticsData?.metrics?.conversionTrend || "steady"}
            />
            
            <MetricCard
              title="Avg Opportunity"
              value={`${avgOpportunityScore}/10`}
              change={analyticsData?.metrics?.opportunityChange || "+0.0"}
              description={analyticsData?.metrics?.opportunityDescription || "No data"}
              icon={CursorArrowRaysIcon}
              trend={analyticsData?.metrics?.opportunityTrend || "steady"}
              isOrange={true}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lead Trend Chart */}
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white ${poppins.className}`}>
                  Lead Generation Trend
                </CardTitle>
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  Lead discovery over time
                </p>
              </CardHeader>
              <CardContent>
                {analyticsData?.trends && analyticsData.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analyticsData.trends}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4500" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff4500" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="#ff4500" 
                        fillOpacity={1} 
                        fill="url(#colorLeads)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-gray-400">
                    <div className="text-center">
                      <p className={`text-sm ${inter.className}`}>No trend data available</p>
                      <p className={`text-xs text-gray-500 mt-1 ${inter.className}`}>Run discovery to start collecting data</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subreddit Performance Leaderboard */}
            <Card className="bg-black border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                    <TrophyIcon className="h-5 w-5 text-orange-500" />
                    Top Subreddits
                  </CardTitle>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    Performance leaderboard
                  </p>
                </div>
                {analyticsData?.subredditPerformance && analyticsData.subredditPerformance.length > 0 && (
                  <Badge variant="outline" className="border-orange-500/20 text-orange-400">
                    {analyticsData.subredditPerformance.length} communities
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <SubredditLeaderboard data={analyticsData?.subredditPerformance || []} />
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Opportunity Distribution */}
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white ${poppins.className}`}>
                  Lead Quality
                </CardTitle>
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  Distribution by score
                </p>
              </CardHeader>
              <CardContent>
                {analyticsData?.opportunityDistribution ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={analyticsData.opportunityDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {analyticsData.opportunityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#000000',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {analyticsData.opportunityDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className={`text-gray-300 ${inter.className}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className={`font-medium text-white ${poppins.className}`}>
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-400">
                    <div className="text-center">
                      <p className={`text-sm ${inter.className}`}>No quality data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white ${poppins.className}`}>
                  Weekly Activity
                </CardTitle>
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  Discovery patterns
                </p>
              </CardHeader>
              <CardContent>
                {analyticsData?.weeklyActivity && analyticsData.weeklyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={analyticsData.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Bar dataKey="activity" fill="#ff6a00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[160px] text-gray-400">
                    <div className="text-center">
                      <p className={`text-sm ${inter.className}`}>No activity data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Details */}
            <Card className="bg-black border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white ${poppins.className}`}>
                  Campaign Details
                </CardTitle>
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  Current configuration
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCampaignData ? (
                  <>
                    <div>
                      <p className={`text-sm font-medium mb-1 text-gray-300 ${inter.className}`}>
                        Keywords Tracked
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {activeCampaignData.generatedKeywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
                            {keyword}
                          </Badge>
                        ))}
                        {activeCampaignData.generatedKeywords.length > 3 && (
                          <Badge variant="outline" className="border-zinc-700 text-gray-400">
                            +{activeCampaignData.generatedKeywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <EyeIcon className="h-3 w-3 text-orange-500" />
                      <span className={`text-gray-300 ${inter.className}`}>
                        {activeCampaignData.targetSubreddits.length} subreddits monitored
                      </span>
                    </div>
                  </>
                ) : (
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    No campaign selected
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lead Status Overview */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>
                Lead Pipeline Status
              </CardTitle>
              <p className={`text-sm text-gray-400 ${inter.className}`}>
                Current lead breakdown by status
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <BoltIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                      {leadStats.new}
                    </p>
                    <p className={`text-sm text-gray-400 ${inter.className}`}>
                      New Leads
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <PaperAirplaneIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                      {leadStats.replied}
                    </p>
                    <p className={`text-sm text-gray-400 ${inter.className}`}>
                      Replied
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <BookmarkIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                      {leadStats.saved}
                    </p>
                    <p className={`text-sm text-gray-400 ${inter.className}`}>
                      Saved
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <UsersIcon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                      {leadStats.all}
                    </p>
                    <p className={`text-sm text-gray-400 ${inter.className}`}>
                      Total Leads
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <AllCommunitiesModal />
    </>
  );
};
