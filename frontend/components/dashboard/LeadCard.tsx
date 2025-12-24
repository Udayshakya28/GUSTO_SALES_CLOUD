"use client";
import React, { useState } from "react";
import {
  MessageSquare, Bookmark, MoreHorizontal, ExternalLink, Clock,
  Target, Loader2, Globe2, ChevronDown, ChevronUp, Star, User,
  XCircle, BookmarkCheck, CheckCircle, RotateCcw, Copy, Check,
  Sparkles, Trash2, TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReplyModal } from "./ReplyModal";
import { Inter, Poppins } from "next/font/google";
import { api } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReplyModal } from "@/hooks/useReplyModal";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define ApiError for local use
export class ApiError extends Error {
  upgradeRequired?: boolean;
  constructor(message: string, upgradeRequired?: boolean) {
    super(message);
    this.name = "ApiError";
    this.upgradeRequired = upgradeRequired;
  }
}

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// The Lead interface should include the isGoogleRanked property
export interface Lead {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  body: string;
  createdAt: number;
  intent: string;
  summary?: string | null;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
  numComments: number;
  upvoteRatio: number;
  isGoogleRanked?: boolean;
}

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, status: Lead['status']) => void;
  onDelete: (leadId: string) => void;
}

const MIN_WORDS_FOR_SUMMARY = 40;

export const LeadCard = ({ lead, onStatusChange, onDelete }: LeadCardProps) => {
  const { getToken } = useAuth();
  const { onOpen: onOpenReplyModal } = useReplyModal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(lead.summary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [status, setStatus] = useState<Lead['status']>(lead.status || 'new');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000);
    if (seconds > 31536000) return Math.floor(seconds / 31536000) + "y ago";
    if (seconds > 2592000) return Math.floor(seconds / 2592000) + "mo ago";
    if (seconds > 86400) return Math.floor(seconds / 86400) + "d ago";
    if (seconds > 3600) return Math.floor(seconds / 3600) + "h ago";
    if (seconds > 60) return Math.floor(seconds / 60) + "m ago";
    return "Just now";
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "solution_seeking": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "pain_point": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "brand_comparison": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusStyle = (s: Lead['status']) => {
    switch (s) {
      case 'saved': return { icon: BookmarkCheck, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'replied': return { icon: CheckCircle, color: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'ignored': return { icon: XCircle, color: 'bg-zinc-700/50 text-gray-400 border-zinc-700' };
      default: return null;
    }
  };
  const statusStyle = getStatusStyle(status);

  const generateSummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const token = await getToken();
      const response = await api.generateSummary(lead.id, lead.body, token);
      setSummary(response.summary);
    } catch (error: any) {
      if (error instanceof ApiError && error.upgradeRequired) setShowUpgradeModal(true);
      else setSummaryError(error.message || "Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleUpdateStatus = async (newStatus: NonNullable<Lead['status']>) => {
    if (isUpdatingStatus) return;
    const previousStatus = status;
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      const token = await getToken();
      await api.updateLeadStatus(lead.id, newStatus, token);
      onStatusChange(lead.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      setStatus(previousStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      await api.deleteLead(lead.id, token);
      toast.success("Lead deleted successfully.");
      onDelete(lead.id);
    } catch (error: any) {
      toast.error("Failed to delete lead", { description: error.message });
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const wordCount = lead.body?.split(' ').length || 0;
  const shouldShowSummary = wordCount >= MIN_WORDS_FOR_SUMMARY;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-black rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-200 overflow-hidden"
      >
        <div className="p-4 sm:p-6">

          {/* Header block: subreddit/author and status/time */}
          <div className="flex flex-col sm:flex-row gap-y-2 items-start sm:items-center justify-between mb-4 w-full">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Globe2 className="w-4 h-4 text-orange-500" />
                <span className={`text-sm font-medium text-orange-400 ${inter.className}`}>r/{lead.subreddit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 truncate">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className={`truncate ${inter.className}`}>u/{lead.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 mt-2 sm:mt-0">
              {statusStyle && (
                <Badge variant="outline" className={`${statusStyle.color} min-w-[85px] flex items-center`}>
                  <statusStyle.icon className="w-3.5 h-3.5 mr-1.5" />
                  <span className={inter.className}>
                    {(status ?? 'New').charAt(0).toUpperCase() + (status ?? 'New').slice(1)}
                  </span>
                </Badge>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                <span className={inter.className}>{timeAgo(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Post Title */}
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2 group"
          >
            <h3 className={`text-base sm:text-lg font-bold text-white group-hover:text-orange-400 transition-colors duration-200 leading-tight ${poppins.className} truncate`}>
              {lead.title}
            </h3>
          </a>

          {/* Chips: Opportunity, Intent, Google Ranked */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span className={`text-sm font-medium ${getOpportunityColor(lead.opportunityScore)} ${inter.className}`}>
                {lead.opportunityScore}% opportunity
              </span>
            </div>
            <Badge variant="outline" className={`${getIntentColor(lead.intent)}`}>
              <span className={inter.className}>
                {lead.intent.replace(/_/g, ' ')}
              </span>
            </Badge>
            {lead.isGoogleRanked && (
              <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Google Ranked
              </Badge>
            )}
          </div>

          {/* Body/Post */}
          {lead.body && (
            <div className="mb-3 sm:mb-4">
              <div className={`text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'} ${inter.className}`}>
                {lead.body}
              </div>
              {wordCount > 50 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 mt-1 p-0 h-auto font-normal"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  <span className={inter.className}>
                    {isExpanded ? 'Show less' : 'Show more'}
                  </span>
                </Button>
              )}
            </div>
          )}

          {/* AI Summary */}
          {shouldShowSummary && (
            <div className="mb-4">
              {!summary && !isSummarizing && (
                <div className="relative group inline-block">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <Card className="relative bg-black border-zinc-800 hover:border-orange-500/50 transition-all duration-300">
                    <CardContent className="p-2 sm:p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateSummary}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 h-7 px-2 text-xs"
                        title="Generate AI Summary"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        <span className={`${inter.className} font-medium`}>AI Summary</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {isSummarizing && (
                <Card className="bg-black border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-3 text-orange-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div>
                        <div className={`font-medium ${poppins.className}`}>
                          Generating AI Summary
                        </div>
                        <div className={`text-xs text-gray-500 ${inter.className}`}>
                          This may take a few seconds...
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {summary && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-lg opacity-20"></div>
                  <Card className="relative bg-black border-zinc-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-sm">
                          <div className="relative">
                            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                          </div>
                          <div>
                            <span className={`text-orange-400 font-semibold ${poppins.className}`}>AI Summary</span>
                            <div className={`text-xs text-gray-500 font-normal ${inter.className}`}>Generated insights</div>
                          </div>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 p-2"
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                        <p className={`text-gray-300 text-sm leading-relaxed pl-4 ${inter.className}`}>{summary}</p>
                      </div>
                      {isCopied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-3 text-xs text-green-400 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span className={inter.className}>Copied to clipboard!</span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {summaryError && (
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-2 h-2 text-white" />
                      </div>
                      <span className={`text-red-400 text-sm ${inter.className}`}>
                        {summaryError}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-800">
            {status !== 'replied' && (
              <Button
                onClick={() => onOpenReplyModal(lead)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                <span className={inter.className}>Reply</span>
              </Button>
            )}

            {status === 'saved' ? (
              <Button
                onClick={() => handleUpdateStatus('new')}
                disabled={isUpdatingStatus}
                variant="outline"
                size="sm"
                className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300"
              >
                {isUpdatingStatus ?
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> :
                  <BookmarkCheck className="w-3.5 h-3.5 mr-2" />
                }
                <span className={inter.className}>Saved</span>
              </Button>
            ) : status !== 'ignored' && status !== 'replied' && (
              <Button
                onClick={() => handleUpdateStatus('saved')}
                disabled={isUpdatingStatus}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white"
              >
                {isUpdatingStatus ?
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> :
                  <Bookmark className="w-3.5 h-3.5 mr-2" />
                }
                <span className={inter.className}>Save</span>
              </Button>
            )}

            {status === 'ignored' ? (
              <Button
                onClick={() => handleUpdateStatus('new')}
                disabled={isUpdatingStatus}
                variant="outline"
                size="sm"
                className="bg-zinc-700/20 text-gray-400 border-zinc-700 hover:bg-zinc-700/40 hover:text-gray-300"
              >
                {isUpdatingStatus ?
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> :
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                }
                <span className={inter.className}>Undo Ignore</span>
              </Button>
            ) : status !== 'replied' && status !== 'saved' && (
              <Button
                onClick={() => handleUpdateStatus('ignored')}
                disabled={isUpdatingStatus}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white"
              >
                {isUpdatingStatus ?
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> :
                  <XCircle className="w-3.5 h-3.5 mr-2" />
                }
                <span className={inter.className}>Ignore</span>
              </Button>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <DropdownMenuItem asChild>
                    <a href={lead.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      View on Reddit
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onSelect={(e) => { e.preventDefault(); setIsConfirmingDelete(true); }}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete Lead
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setIsConfirmingDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm mx-2"
            >
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
              <p className="text-zinc-400 mt-2 mb-6">Are you sure you want to permanently delete this lead? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsConfirmingDelete(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <Card className="max-w-md mx-4 bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>Upgrade Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-gray-400 ${inter.className}`}>This feature requires a Pro plan.</p>
              <Button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <span className={inter.className}>Close</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
