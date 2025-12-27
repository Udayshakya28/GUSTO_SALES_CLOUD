"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Check, AlertCircle, User, RefreshCw, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

interface RedditConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

interface RedditStatus {
  connected: boolean;
  method: 'devvit';
  username?: string;
  karma?: number;
  verified?: boolean;
  message?: string;
  error?: string;
}

export const RedditConnection = ({ onConnectionChange }: RedditConnectionProps) => {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<RedditStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Reddit connection status
  const fetchStatus = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const token = await getToken();
      const response = await api.getRedditStatus(token);
      setStatus(response);
      onConnectionChange?.(response.connected);
    } catch (err: any) {
      setError(err.message || 'Failed to check Reddit connection status');
      setStatus({
        connected: false,
        method: 'devvit',
        message: 'Failed to check status',
        error: err.message
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getToken, onConnectionChange]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);


  if (isLoading) {
    return (
      <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-[#343536] rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-[#343536] rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-[#343536] rounded w-32"></div>
        </div>
      </div>
    );
  }

  const isConnected = status?.connected || false;
  const redditUsername = status?.username || 'user';
  const redditKarma = status?.karma || 0;

  return (
    <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isConnected ? 'bg-green-500/10' : 'bg-gray-500/10'
          }`}>
            {isConnected ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">Reddit Account</h3>
            <p className="text-sm text-gray-400">
              {isConnected 
                ? `Connected as u/${redditUsername}`
                : 'Connect your Reddit account to post replies'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="text-xs text-gray-400">
              {redditKarma} karma
            </span>
          )}
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {status?.error && !isConnected && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-medium">{status.message}</p>
              {status.error && (
                <p className="text-yellow-300/80 text-xs mt-1">{status.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#272729] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Username:</span>
              <span className="text-sm font-medium text-white">u/{redditUsername}</span>
            </div>
            <a
              href={`https://reddit.com/u/${redditUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#11DFFF] hover:text-[#0dcddd] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-[#272729] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Karma:</span>
              <span className="text-sm font-medium text-white">{redditKarma.toLocaleString()}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              (redditKarma || 0) >= 10 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {(redditKarma || 0) >= 10 ? 'Verified' : 'Low karma'}
            </span>
          </div>

          {status?.verified && (
            <div className="flex items-center gap-2 p-3 bg-[#272729] rounded-lg">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Email verified</span>
            </div>
          )}

          <button
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="w-full px-4 py-2 bg-[#272729] text-white rounded-lg hover:bg-[#343536] transition-colors text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 bg-[#272729] rounded-lg border border-[#343536]">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white mb-2">Setup DEVVIT_TOKEN</h4>
                <p className="text-xs text-gray-400 mb-3">
                  This app uses Devvit authentication to connect to Reddit. You need to configure the DEVVIT_TOKEN environment variable.
                </p>
                <div className="space-y-2 text-xs text-gray-300">
                  <p><strong className="text-white">Step 1:</strong> Run <code className="bg-[#1a1a1b] px-1.5 py-0.5 rounded">npx devvit login</code> in your terminal</p>
                  <p><strong className="text-white">Step 2:</strong> Run <code className="bg-[#1a1a1b] px-1.5 py-0.5 rounded">find_token.ps1</code> (Windows) or check <code className="bg-[#1a1a1b] px-1.5 py-0.5 rounded">~/.devvit/token</code></p>
                  <p><strong className="text-white">Step 3:</strong> Add <code className="bg-[#1a1a1b] px-1.5 py-0.5 rounded">DEVVIT_TOKEN</code> to your Vercel environment variables</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="w-full px-4 py-2 bg-[#11DFFF] text-white rounded-lg hover:bg-[#0dcddd] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Check Connection Status
              </>
            )}
          </button>
        </div>
      )}

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400">
            <strong>Why connect?</strong> You need a Reddit account configured via DEVVIT_TOKEN to post replies. 
            The token is stored securely as an environment variable on your server.
          </p>
        </div>
      )}
    </div>
  );
};