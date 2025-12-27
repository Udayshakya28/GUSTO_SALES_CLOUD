"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  Send,
  Bookmark,
  Settings,
  ChevronRight,
  Users,
  Target,
  BarChart3,
  Zap,
  Eye,
  ChevronDown,
  ChevronLeft,
  Crown,
  Webhook,
  PieChart,
  Activity,
  FolderOpen // Add this import for campaign management
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface Campaign {
  id: string;
  userId: string;
  name: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  generatedDescription: string;
  targetSubreddits: string[];
  competitors: string[];
  createdAt: string;
  lastManualDiscoveryAt?: string | null;
  lastGlobalDiscoveryAt?: string | null;
  lastTargetedDiscoveryAt?: string | null;
  isActive: boolean;
  _count?: {
    leads: number;
  };
}

interface Props {
  campaigns: Campaign[];
  activeCampaign: string | null;
  setActiveCampaign: (id: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  stats: {
    new: number;
    replied: number;
    saved: number;
    ignored: number;
    all: number;
  };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeView: 'dashboard' | 'leads';
  setActiveView: (view: 'dashboard' | 'leads') => void;
  isMobile: boolean;
}

export const DashboardSidebar = ({
  campaigns,
  activeCampaign,
  setActiveCampaign,
  activeFilter,
  setActiveFilter,
  stats,
  isCollapsed,
  setIsCollapsed,
  activeView,
  setActiveView,
  isMobile
}: Props) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();

  if (!isLoaded) {
    return (
      <div className="h-screen p-4 border-r bg-black border-zinc-800 sticky top-0 z-20">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-zinc-900 rounded"></div>
          <div className="h-8 bg-zinc-900 rounded w-3/4"></div>
          <div className="h-8 bg-zinc-900 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const redditUsername = user.publicMetadata?.redditUsername as string | undefined;

  const FilterButton = ({ icon: Icon, label, count, isActive, onClick }: any) => (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} h-9 transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'hover:bg-zinc-900 text-gray-300 hover:text-white'
      }`}
      title={isCollapsed ? `${label} (${count})` : ''}
    >
      <Icon className="h-4 w-4 mr-2" />
      {!isCollapsed && (
        <>
          <span className={`flex-1 text-left ${inter.className}`}>{label}</span>
          <Badge 
            variant="outline" 
            className={`ml-auto text-xs ${
              isActive 
                ? 'border-white/30 text-white bg-white/10' 
                : 'border-zinc-700 text-gray-400 bg-transparent hover:bg-zinc-900'
            }`}
          >
            {count}
          </Badge>
        </>
      )}
    </Button>
  );

  const NavButton = ({ href, icon: Icon, label, isActive, onClick }: any) => (
    <Button
      onClick={onClick || (() => {})}
      variant="ghost"
      className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} h-9 transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'hover:bg-zinc-900 text-gray-300 hover:text-white'
      }`}
      title={isCollapsed ? label : ''}
      asChild={!!href}
    >
      {href ? (
        <Link href={href}>
          <Icon className="h-4 w-4 mr-2" />
          {!isCollapsed && <span className={inter.className}>{label}</span>}
        </Link>
      ) : (
        <>
          <Icon className="h-4 w-4 mr-2" />
          {!isCollapsed && <span className={inter.className}>{label}</span>}
        </>
      )}
    </Button>
  );

  return (
    <div className="h-screen flex flex-col bg-black border-r border-zinc-800 sticky top-0 z-20">
      {/* User Profile Section */}
      <div className="p-4 border-b border-zinc-800 bg-black">
        {(isCollapsed && !isMobile) ? (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
              <AvatarFallback className="bg-orange-500 text-white">
                {user.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCollapsed(false)}
              className="p-1 h-6 w-6 hover:bg-zinc-900 text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {user.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate text-white ${poppins.className}`}>
                  {user.fullName || 'User'}
                </p>
                {redditUsername && (
                  <p className={`text-xs text-orange-400 truncate ${inter.className}`}>
                    u/{redditUsername}
                  </p>
                )}
              </div>
              {/* Hide collapse button on mobile */}
              {!isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 h-6 w-6 hover:bg-zinc-900 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {/* Main Navigation */}
        <div>
          {!isCollapsed && (
            <p className={`text-xs font-medium text-gray-500 mb-3 px-3 uppercase tracking-wider ${inter.className}`}>
              Main
            </p>
          )}
          <div className="space-y-1">
            <NavButton 
              icon={BarChart3} 
              label="Dashboard" 
              isActive={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />
            <NavButton 
              icon={Inbox} 
              label="Leads" 
              isActive={activeView === 'leads'}
              onClick={() => setActiveView('leads')}
            />
            <NavButton 
              href="/dashboard/campaigns" 
              icon={FolderOpen} 
              label="Campaigns" 
              isActive={pathname === '/dashboard/campaigns'} 
            />
            <NavButton 
              href="/dashboard/webhooks" 
              icon={Webhook} 
              label="Webhooks" 
              isActive={pathname === '/dashboard/webhooks'} 
            />
            <NavButton 
              href="/dashboard/performance" 
              icon={Activity} 
              label="Performance" 
              isActive={pathname === '/dashboard/performance'} 
            />
            <NavButton 
              href="/dashboard/settings" 
              icon={Settings} 
              label="Settings" 
              isActive={pathname === '/dashboard/settings'} 
            />
          </div>
        </div>

        {/* Inbox Section */}
        {activeView === 'leads' && (
          <>
            <Separator className="bg-zinc-800" />
            <div>
              {!isCollapsed && (
                <p className={`text-xs font-medium text-gray-500 mb-3 px-3 uppercase tracking-wider ${inter.className}`}>
                  Inbox
                </p>
              )}
              <div className="space-y-1">
                <FilterButton 
                  icon={Zap} 
                  label="New" 
                  count={stats.new} 
                  isActive={activeFilter === 'new'} 
                  onClick={() => setActiveFilter('new')} 
                />
                <FilterButton 
                  icon={Send} 
                  label="Replied" 
                  count={stats.replied} 
                  isActive={activeFilter === 'replied'} 
                  onClick={() => setActiveFilter('replied')} 
                />
                <FilterButton 
                  icon={Bookmark} 
                  label="Saved" 
                  count={stats.saved} 
                  isActive={activeFilter === 'saved'} 
                  onClick={() => setActiveFilter('saved')} 
                />
                <FilterButton 
                  icon={Users} 
                  label="All" 
                  count={stats.all} 
                  isActive={activeFilter === 'all'} 
                  onClick={() => setActiveFilter('all')} 
                />
              </div>
            </div>

            {/* Campaigns Section */}
            {!isCollapsed && (
              <>
                <Separator className="bg-zinc-800" />
                <div>
                  <p className={`text-xs font-medium text-gray-500 mb-3 px-3 uppercase tracking-wider ${inter.className}`}>
                    Campaigns
                  </p>
                  <div className="space-y-2">
                    {campaigns.length === 0 ? (
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-3 text-center">
                          <p className={`text-xs text-gray-400 ${inter.className}`}>No campaigns</p>
                        </CardContent>
                      </Card>
                    ) : (
                      campaigns.map((campaign) => (
                        <div key={campaign.id}>
                          <Button
                            onClick={() => setActiveCampaign(campaign.id)}
                            variant="ghost"
                            className={`w-full justify-between text-left h-auto p-3 rounded-lg transition-all duration-200 ${
                              activeCampaign === campaign.id 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'hover:bg-zinc-900 text-gray-300 hover:text-white'
                            }`}
                          >
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${poppins.className}`}>
                                {new URL(campaign.analyzedUrl).hostname}
                              </div>
                            </div>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          
                          {activeCampaign === campaign.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mx-3 mt-1 mb-2"
                            >
                              <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-3 space-y-3">
                                  <div>
                                    <p className={`text-xs font-medium mb-2 text-gray-300 ${inter.className}`}>
                                      Keywords
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {campaign.generatedKeywords.slice(0, 2).map((keyword) => (
                                        <Badge key={keyword} className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
                                          {keyword}
                                        </Badge>
                                      ))}
                                      {campaign.generatedKeywords.length > 2 && (
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs border-zinc-700 text-gray-400"
                                        >
                                          +{campaign.generatedKeywords.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Eye className="h-3 w-3 text-orange-500" />
                                    <span className={inter.className}>{campaign.targetSubreddits.length} subreddits</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};