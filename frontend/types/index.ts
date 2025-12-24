// This interface now serves as the single source of truth for what a Lead object looks like.
export interface Lead {
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
    // This is the correct, specific type for the lead's status.
    status: "new" | "replied" | "saved" | "ignored";
  }
  
  // Interface for a Campaign
  export interface Campaign {
    id: string;
    name: string;
    userId: string;
    analyzedUrl: string;
    generatedKeywords: string[];
    generatedDescription: string;
    targetSubreddits: string[];
    competitors: string[];
    createdAt: string;
    _count?: {
      leads: number;
    };
  }