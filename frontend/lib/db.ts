// RedLead/frontend/lib/db.ts
// Simple in-memory storage for Localhost demo

export type Campaign = {
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
};

export type Lead = {
    id: string;
    title: string;
    author: string;
    subreddit: string;
    url: string;
    body: string;
    createdAt: number;
    intent: string;
    summary?: string;
    opportunityScore: number;
    status: 'new' | 'replied' | 'saved' | 'ignored';
    numComments: number;
    upvoteRatio: number;
};

export type Webhook = {
    id: string;
    name: string;
    url: string;
    type: 'discord' | 'slack' | 'generic' | 'email' | 'sms';
    isActive: boolean;
    events: string[];
    createdAt: string;
    lastTriggered?: string;
    filters?: {
        minOpportunityScore?: number;
        subreddits?: string[];
        keywords?: string[];
        priority?: string[];
    };
    rateLimitMinutes?: number;
};

// Global storage to persist across hot reloads in dev
declare global {
    var rl_campaigns: Campaign[];
    var rl_leads: Record<string, Lead[]>;
    var rl_webhooks: Webhook[];
}

if (!global.rl_campaigns) {
    global.rl_campaigns = [
        {
            id: 'demo-campaign-1',
            userId: 'user_1',
            name: 'Devvit Demo',
            analyzedUrl: 'https://devvit.com',
            generatedKeywords: ['reddit app', 'developer', 'API'],
            generatedDescription: 'A platform for building Reddit apps.',
            targetSubreddits: ['devvit', 'redditdev', 'programming'],
            competitors: [],
            createdAt: new Date().toISOString()
        }
    ];
}

if (!global.rl_leads) {
    global.rl_leads = {};
}

if (!global.rl_webhooks) {
    global.rl_webhooks = [];
}

export const db = {
    getCampaigns: () => global.rl_campaigns,
    getCampaign: (id: string) => global.rl_campaigns.find(c => c.id === id),
    addCampaign: (campaign: Campaign) => {
        global.rl_campaigns.push(campaign);
        return campaign;
    },
    getLeads: (campaignId: string) => global.rl_leads[campaignId] || [],
    addLeads: (campaignId: string, newLeads: Lead[]) => {
        const existing = global.rl_leads[campaignId] || [];
        const combined = [...existing, ...newLeads.filter(nl => !existing.find(el => el.id === nl.id))];
        global.rl_leads[campaignId] = combined;
        return combined;
    },
    updateLeadStatus: (leadId: string, status: Lead['status']) => {
        for (const campaignId in global.rl_leads) {
            const leads = global.rl_leads[campaignId];
            const lead = leads.find(l => l.id === leadId);
            if (lead) {
                lead.status = status;
                return lead;
            }
        }
        return null;
    },
    updateCampaign: (id: string, data: Partial<Campaign>) => {
        const index = global.rl_campaigns.findIndex(c => c.id === id);
        if (index !== -1) {
            global.rl_campaigns[index] = { ...global.rl_campaigns[index], ...data };
            return global.rl_campaigns[index];
        }
        return null;
    },
    deleteCampaign: (id: string) => {
        const index = global.rl_campaigns.findIndex(c => c.id === id);
        if (index !== -1) {
            global.rl_campaigns.splice(index, 1);
            delete global.rl_leads[id];
            return true;
        }
        return false;
    },

    // Webhooks
    getWebhooks: () => global.rl_webhooks,
    addWebhook: (webhook: Webhook) => {
        global.rl_webhooks.push(webhook);
        return webhook;
    },
    updateWebhook: (id: string, data: Partial<Webhook>) => {
        const index = global.rl_webhooks.findIndex(w => w.id === id);
        if (index !== -1) {
            global.rl_webhooks[index] = { ...global.rl_webhooks[index], ...data };
            return global.rl_webhooks[index];
        }
        return null;
    },
    deleteWebhook: (id: string) => {
        const index = global.rl_webhooks.findIndex(w => w.id === id);
        if (index !== -1) {
            global.rl_webhooks.splice(index, 1);
            return true;
        }
        return false;
    }
};
