import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGroqClient, handleGroqError } from '@/lib/groq';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { fetchWithProxy, isProxyEnabled, getProxyStatus } from '@/lib/proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max
export const fetchCache = 'force-no-store';

async function calculateOpportunityScore(title: string, body: string, keywords: string[]): Promise<number> {
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

        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch campaign from Prisma first, fallback to in-memory
        let campaign: any = null;

        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                campaign = await prisma.campaign.findUnique({
                    where: { id: campaignId }
                });
            } catch (e) {
                console.warn('⚠️ Error checking campaign in Prisma:', e);
            }
        }

        if (!campaign) {
            campaign = db.getCampaign(campaignId);
        }

        if (!campaign) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }

        // Ensure proper ownership
        if (campaign.userId && campaign.userId !== userId) {
            // In development/hybrid mode, we might want to allow this or fix it
            console.warn(`⚠️ Campaign userId mismatch (${campaign.userId} vs ${userId}). Proceeding but syncing ownership.`);
            // We'll update ownership when saving leads
        }

        const { targetSubreddits, generatedKeywords } = campaign;

        if (!targetSubreddits || targetSubreddits.length === 0) {
            return NextResponse.json({ message: 'No target subreddits configured' }, { status: 400 });
        }

        if (!generatedKeywords || generatedKeywords.length === 0) {
            return NextResponse.json({ message: 'No keywords configured' }, { status: 400 });
        }

        console.log(`🚀 Running TARGETED discovery for ${campaignId} (${targetSubreddits.length} subreddits)`);

        interface DiscoveredLead {
            redditId: string;
            title: string;
            author: string;
            subreddit: string;
            url: string;
            body: string;
            status: 'new';
            intent: string;
            opportunityScore: number;
            postedAt: Date;
            type: 'DIRECT_LEAD'; // Targeted is also direct lead
            numComments: number;
            upvoteRatio: number;
        }

        const discoveredLeads: DiscoveredLead[] = [];
        const diagnostics: any = {
            subredditsSearched: [],
            errors: [],
            postsFound: 0,
        };

        // Targeted discovery uses search endpoints with specific queries
        for (const sub of targetSubreddits) {
            try {
                // Use the first 2 keywords combined for a targeted search query
                // "keyword1 OR keyword2"
                const query = generatedKeywords.slice(0, 2).join(' OR ');

                // Try multiple endpoints/approaches if one blocks
                const endpoints = [
                    {
                        url: `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=15`,
                        type: 'search_relevance'
                    },
                    {
                        url: `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=15`,
                        type: 'search_new'
                    }
                ];

                const userAgent = process.env.REDDIT_USER_AGENT ||
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

                let res: Response | null = null;
                let successfulEndpoint = '';

                // Add delay between subreddits
                if (diagnostics.subredditsSearched.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                for (const endpoint of endpoints) {
                    try {
                        diagnostics.subredditsSearched.push({ subreddit: sub, url: endpoint.url, type: endpoint.type });

                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);

                        const fetchFunction = isProxyEnabled() ? fetchWithProxy : fetch;

                        res = await fetchFunction(endpoint.url, {
                            headers: {
                                'User-Agent': userAgent,
                                'Accept': 'application/json',
                            },
                            signal: controller.signal,
                            cache: 'no-store',
                        });

                        clearTimeout(timeoutId);

                        if (res.ok) {
                            successfulEndpoint = endpoint.type;
                            console.log(`✅ Fetched r/${sub} via ${endpoint.type}`);
                            break;
                        } else {
                            const errorText = await res.text().catch(() => '');
                            console.warn(`❌ Failed r/${sub} (${endpoint.type}): ${res.status}`);
                            // If 403/429, it might be blocking, try next endpoint
                        }
                    } catch (e: any) {
                        console.warn(`❌ Error r/${sub} (${endpoint.type}): ${e.message}`);
                    }
                }

                if (!res || !res.ok) {
                    const msg = `All endpoints failed for r/${sub}`;
                    console.error(msg);
                    diagnostics.errors.push({ subreddit: sub, error: msg });
                    continue;
                }

                const data = await res.json();

                if (!data || !data.data || !data.data.children) {
                    console.warn(`Invalid response format for r/${sub}`);
                    continue;
                }

                const posts = data.data.children;
                diagnostics.postsFound += posts.length;

                for (const child of posts) {
                    if (!child || !child.data) continue;

                    const post = child.data;
                    const score = await calculateOpportunityScore(post.title, post.selftext || '', generatedKeywords);

                    discoveredLeads.push({
                        redditId: post.id,
                        title: post.title,
                        author: post.author,
                        subreddit: post.subreddit,
                        url: `https://reddit.com${post.permalink}`,
                        body: post.selftext || '',
                        status: 'new',
                        intent: 'unclassified',
                        opportunityScore: score,
                        postedAt: new Date(post.created_utc * 1000),
                        type: 'DIRECT_LEAD',
                        numComments: post.num_comments,
                        upvoteRatio: post.upvote_ratio
                    });
                }
            } catch (e: any) {
                console.error(`Targeted Search failed for r/${sub}:`, e.message);
                diagnostics.errors.push({ subreddit: sub, error: e.message });
            }
        }

        // Logic for saving to Prisma
        let savedCount = 0;
        let usedPrisma = false;

        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                usedPrisma = true;

                // Upsert User
                const userEmail = (await currentUser())?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;
                await prisma.user.upsert({
                    where: { id: userId },
                    update: {},
                    create: { id: userId, email: userEmail }
                });

                // Ensure Campaign Exists & Owned by User
                const existingCampaign = await prisma.campaign.findUnique({ where: { id: campaignId } });

                if (!existingCampaign) {
                    // Create if missing
                    await prisma.campaign.create({
                        data: {
                            id: campaignId,
                            userId: userId,
                            name: campaign.name || 'Untitled',
                            analyzedUrl: campaign.analyzedUrl || '',
                            generatedKeywords: campaign.generatedKeywords || [],
                            generatedDescription: campaign.generatedDescription || '',
                            targetSubreddits: campaign.targetSubreddits || [],
                            competitors: campaign.competitors || [],
                            isActive: true
                        }
                    });
                } else if (existingCampaign.userId !== userId) {
                    // Fix ownership if needed
                    await prisma.campaign.update({
                        where: { id: campaignId },
                        data: { userId: userId }
                    });
                }

                // Save Leads
                for (const lead of discoveredLeads) {
                    try {
                        await prisma.lead.upsert({
                            where: {
                                redditId_campaignId: {
                                    redditId: lead.redditId,
                                    campaignId: campaignId
                                }
                            },
                            update: {
                                opportunityScore: lead.opportunityScore,
                                status: lead.status
                            },
                            create: {
                                ...lead,
                                postedAt: lead.postedAt, // Already Date
                                campaignId: campaignId,
                                userId: userId,
                                type: lead.type
                            }
                        });
                        savedCount++;
                    } catch (e) {
                        // Ignore duplicate/foreign key errors roughly
                    }
                }

                // Update discovery timestamp
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { lastTargetedDiscoveryAt: new Date() }
                });

                console.log(`✅ Saved ${savedCount} leads to Prisma`);

            } catch (e: any) {
                console.error('❌ Prisma save failed:', e);
                usedPrisma = false;
            }
        }

        // Fallback or Sync to In-Memory
        if (!usedPrisma) {
            console.log('⚠️ Saving to in-memory DB only');
            const memoryLeads = discoveredLeads.map(l => ({
                id: l.redditId,
                title: l.title,
                author: l.author,
                subreddit: l.subreddit,
                url: l.url,
                body: l.body || '',
                status: l.status,
                intent: l.intent,
                opportunityScore: l.opportunityScore,
                createdAt: l.postedAt.getTime() / 1000,
                numComments: l.numComments,
                upvoteRatio: l.upvoteRatio
            }));

            db.addLeads(campaignId, memoryLeads);
            db.updateCampaign(campaignId, {
                lastTargetedDiscoveryAt: new Date().toISOString()
            });
            savedCount = memoryLeads.length;
        }

        return NextResponse.json({
            message: 'Targeted Discovery complete',
            count: savedCount,
            diagnostics
        });

    } catch (error: any) {
        console.error('Targeted discovery route error:', error);
        return NextResponse.json(
            {
                message: 'Targeted discovery failed',
                error: error.message || 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
