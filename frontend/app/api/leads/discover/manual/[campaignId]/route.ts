import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGroqClient, handleGroqError } from '@/lib/groq';

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

export const runtime = 'nodejs'; // Ensure this runs on Node.js runtime for Vercel

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

        // Simulate search via Reddit Public API (as a "Gateway")
        for (const sub of targetSubreddits) {
            try {
                const query = generatedKeywords[0];
                const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=5`;

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const res = await fetch(url, { 
                    headers: { 
                        'User-Agent': process.env.REDDIT_USER_AGENT || 'RedLead/1.0.0 (by /u/RedLeadApp)'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!res.ok) {
                    console.error(`Reddit API error for r/${sub}: ${res.status} ${res.statusText}`);
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
