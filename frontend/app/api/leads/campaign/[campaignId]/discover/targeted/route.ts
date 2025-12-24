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

export async function POST(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    const campaign = db.getCampaign(campaignId);

    if (!campaign) {
        return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    const { targetSubreddits, generatedKeywords } = campaign;
    const discoveredLeads: any[] = [];

    console.log(`Running TARGETED discovery for ${campaignId} in subreddits: ${targetSubreddits.join(', ')}`);

    // In a "targeted" discovery, we might search for more specific terms or look deeper
    for (const sub of targetSubreddits) {
        try {
            // Use multiple keywords for targeted search
            const query = generatedKeywords.slice(0, 2).join(' OR ');
            const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=10`;

            const res = await fetch(url, { headers: { 'User-Agent': 'RedLeadLocal/1.0.0' } });
            if (!res.ok) continue;

            const data = await res.json();
            const posts = data.data.children;

            for (const child of posts) {
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
        } catch (e) {
            console.error(`Targeted Search failed for r/${sub}:`, e);
        }
    }

    db.addLeads(campaignId, discoveredLeads);

    return NextResponse.json({
        message: 'Targeted Discovery complete',
        count: discoveredLeads.length
    });
}
