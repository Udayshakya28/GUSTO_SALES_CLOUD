import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGroqClient, handleGroqError } from '@/lib/groq';

// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for discovery

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

async function calculateOpportunityScore(title: string, body: string, keywords: string[]): Promise<number> {
    // Get client at runtime to ensure env vars are loaded
    const groq = getGroqClient();
    if (!groq) return Math.floor(Math.random() * 40) + 60;

    try {
        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama3-70b-8192",
            messages: [
                { role: "system", content: "You are a lead scoring AI. Rate the following Reddit post on a scale of 0-100 based on how likely it is to be a lead for a product described by these keywords: " + keywords.join(', ') + ". Return ONLY the number." },
                { role: "user", content: `Title: ${title}\nBody: ${body.substring(0, 500)}` }
            ],
            max_tokens: 10,
        });

        const score = parseInt(completion.choices[0].message.content || "50");
        return isNaN(score) ? 50 : score;
    } catch (e: any) {
        return handleGroqError(e, 50);
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        
        if (!campaignId) {
            return NextResponse.json({ message: 'Campaign ID is required' }, { status: 400 });
        }

        const campaign = db.getCampaign(campaignId);

        if (!campaign) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }

        const { targetSubreddits, generatedKeywords } = campaign;
        
        if (!targetSubreddits || targetSubreddits.length === 0) {
            return NextResponse.json({ message: 'No target subreddits configured' }, { status: 400 });
        }

        if (!generatedKeywords || generatedKeywords.length === 0) {
            return NextResponse.json({ message: 'No keywords configured' }, { status: 400 });
        }

        const discoveredLeads: any[] = [];

        // Search via Reddit Public JSON API (no authentication required)
        // Reddit's public API allows reading posts without credentials
        for (const sub of targetSubreddits) {
            try {
                const query = generatedKeywords[0];
                // Reddit's public JSON API endpoint - accessible without authentication
                const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=5`;

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for Vercel
                
                // Reddit's public API requires a proper User-Agent header
                // Format: "platform:appid:version (by /u/username)"
                const userAgent = process.env.REDDIT_USER_AGENT || 
                    'web:RedLead:1.0.0 (by /u/RedLeadApp)';
                
                const res = await fetch(url, { 
                    headers: { 
                        'User-Agent': userAgent,
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    signal: controller.signal,
                    // Add cache control to avoid stale data
                    cache: 'no-store',
                });
                
                clearTimeout(timeoutId);
                
                if (!res.ok) {
                    const errorText = await res.text().catch(() => 'Unknown error');
                    console.error(`Reddit API error for r/${sub}: ${res.status} ${res.statusText}`, errorText);
                    
                    // If rate limited (429), wait a bit before continuing
                    if (res.status === 429) {
                        console.warn('Rate limited by Reddit, waiting 2 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    continue;
                }

                const data = await res.json();
                
                if (!data || !data.data || !data.data.children) {
                    console.warn(`Invalid response format for r/${sub}`);
                    continue;
                }

                const posts = data.data.children;

                for (const child of posts) {
                    if (!child || !child.data) continue;
                    
                    const post = child.data;
                    const score = await calculateOpportunityScore(post.title, post.selftext || '', generatedKeywords);

                    discoveredLeads.push({
                        id: post.id,
                        title: post.title,
                        author: post.author,
                        subreddit: post.subreddit,
                        url: `https://reddit.com${post.permalink}`,
                        body: post.selftext || '',
                        status: 'new',
                        intent: 'unclassified',
                        opportunityScore: score,
                        createdAt: post.created_utc,
                        numComments: post.num_comments,
                        upvoteRatio: post.upvote_ratio
                    });
                }
            } catch (e: any) {
                console.error(`Search failed for r/${sub}:`, e.message || e);
                // Continue with other subreddits even if one fails
            }
        }

        db.addLeads(campaignId, discoveredLeads);

        // Update last discovery timestamp
        db.updateCampaign(campaignId, { 
            lastManualDiscoveryAt: new Date().toISOString() 
        });

        return NextResponse.json({
            message: 'Discovery complete',
            count: discoveredLeads.length
        });
    } catch (error: any) {
        console.error('Discovery route error:', error);
        return NextResponse.json(
            { 
                message: 'Discovery failed', 
                error: error.message || 'Unknown error occurred' 
            }, 
            { status: 500 }
        );
    }
}
