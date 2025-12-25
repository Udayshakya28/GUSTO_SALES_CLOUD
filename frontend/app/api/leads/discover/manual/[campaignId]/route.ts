import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGroqClient, handleGroqError } from '@/lib/groq';
import { fetchWithProxy, isProxyEnabled, getProxyStatus } from '@/lib/proxy';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for discovery
export const fetchCache = 'force-no-store';

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin');
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true',
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

        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const campaign = db.getCampaign(campaignId);

        if (!campaign) {
            console.error(`❌ Campaign not found: ${campaignId}`);
            // Return detailed error for debugging
            const allCampaigns = db.getCampaigns();
            return NextResponse.json({ 
                message: 'Campaign not found',
                campaignId,
                availableCampaigns: allCampaigns.map(c => ({ id: c.id, name: c.name })),
                note: 'In-memory database resets on each deployment. Campaign may need to be recreated.'
            }, { status: 404 });
        }

        const { targetSubreddits, generatedKeywords } = campaign;
        
        console.log(`📋 Campaign config:`, {
            campaignId,
            targetSubreddits: targetSubreddits?.length || 0,
            generatedKeywords: generatedKeywords?.length || 0,
        });
        
        if (!targetSubreddits || targetSubreddits.length === 0) {
            console.error(`❌ No target subreddits configured for campaign: ${campaignId}`);
            return NextResponse.json({ 
                message: 'No target subreddits configured',
                campaignId,
                campaign: { id: campaign.id, name: campaign.name }
            }, { status: 400 });
        }

        if (!generatedKeywords || generatedKeywords.length === 0) {
            console.error(`❌ No keywords configured for campaign: ${campaignId}`);
            return NextResponse.json({ 
                message: 'No keywords configured',
                campaignId,
                campaign: { id: campaign.id, name: campaign.name }
            }, { status: 400 });
        }

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
            type: 'DIRECT_LEAD';
            numComments: number;
            upvoteRatio: number;
        }
        
        const discoveredLeads: DiscoveredLead[] = [];
        const proxyStatus = getProxyStatus();
        const diagnostics: any = {
            subredditsSearched: [],
            errors: [],
            postsFound: 0,
            groqAvailable: !!getGroqClient(),
            groqModel: process.env.GROQ_MODEL || "llama3-70b-8192",
            proxyEnabled: proxyStatus.enabled,
            proxyType: proxyStatus.type,
            proxyConfigured: proxyStatus.configured,
        };

        // Search via Reddit Public JSON API (no authentication required)
        // Reddit's public API allows reading posts without credentials
        // NOTE: Reddit blocks requests from cloud providers (Vercel, AWS Lambda, etc.)
        // We'll try multiple endpoints and filter posts client-side if search is blocked
        for (const sub of targetSubreddits) {
            try {
                const query = generatedKeywords[0];
                
                // Try multiple endpoints - Reddit may block search.json but allow other endpoints
                const endpoints = [
                    { url: `https://www.reddit.com/r/${sub}/new.json?limit=25`, type: 'new' },
                    { url: `https://www.reddit.com/r/${sub}/hot.json?limit=25`, type: 'hot' },
                    { url: `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=25`, type: 'search' },
                ];
                
                let res: Response | null = null;
                let successfulEndpoint: string = '';
                let lastError: any = null;

                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for Vercel
                
                // Reddit's public API requires a proper User-Agent header
                // Reddit blocks requests without proper User-Agent or with suspicious patterns
                // Use a browser-like User-Agent to avoid 403 blocks
                const userAgent = process.env.REDDIT_USER_AGENT || 
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
                
                // Add a small delay between subreddits to avoid rate limiting
                if (diagnostics.subredditsSearched.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                // Try each endpoint until one works
                for (const endpoint of endpoints) {
                    try {
                        diagnostics.subredditsSearched.push({ 
                            subreddit: sub, 
                            query, 
                            url: endpoint.url, 
                            type: endpoint.type 
                        });
                        
                        // Create abort controller for timeout
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 15000);
                        
                        // Use proxy if enabled, otherwise direct fetch
                        const fetchFunction = isProxyEnabled() ? fetchWithProxy : fetch;
                        
                        res = await fetchFunction(endpoint.url, { 
                            headers: { 
                                'User-Agent': userAgent,
                                'Accept': 'application/json',
                                'Accept-Language': 'en-US,en;q=0.9',
                                'Referer': `https://www.reddit.com/r/${sub}/`,
                                'Origin': 'https://www.reddit.com',
                            },
                            signal: controller.signal,
                            cache: 'no-store',
                            redirect: 'follow',
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (res.ok) {
                            successfulEndpoint = endpoint.url;
                            console.log(`✅ Successfully fetched from r/${sub} using ${endpoint.type} endpoint`);
                            break; // Success, exit the loop
                        } else {
                            lastError = { 
                                status: res.status, 
                                statusText: res.statusText, 
                                url: endpoint.url,
                                type: endpoint.type
                            };
                            console.warn(`❌ Failed ${endpoint.type} endpoint for r/${sub}: ${res.status} ${res.statusText}`);
                        }
                    } catch (e: any) {
                        lastError = { error: e.message, url: endpoint.url, type: endpoint.type };
                        console.warn(`❌ Error with ${endpoint.type} endpoint for r/${sub}:`, e.message);
                        continue; // Try next endpoint
                    }
                }
                
                // If all endpoints failed
                if (!res || !res.ok) {
                    const errorText = lastError?.error || `All endpoints failed (last: ${lastError?.status || 'unknown'})`;
                    const errorMsg = `Reddit API error for r/${sub}: ${res?.status || 'Network'} ${res?.statusText || errorText}`;
                    console.error(`❌ All Reddit endpoints failed for r/${sub}:`, {
                        status: res?.status,
                        statusText: res?.statusText,
                        endpoints: endpoints.map(e => `${e.type}: ${e.url}`),
                        lastError
                    });
                    diagnostics.errors.push({ 
                        subreddit: sub, 
                        error: errorMsg, 
                        status: res?.status || 0,
                        statusText: res?.statusText || errorText,
                        endpoints: endpoints.map(e => e.type),
                        allBlocked: res?.status === 403
                    });
                    
                    if (res?.status === 403) {
                        console.warn(`⚠️ Reddit blocked all endpoints for r/${sub} - Vercel IP blocking`);
                    }
                    continue;
                }

                const data = await res.json();
                
                if (!data || !data.data || !data.data.children) {
                    const warnMsg = `Invalid response format for r/${sub}`;
                    console.warn(warnMsg);
                    diagnostics.errors.push({ subreddit: sub, error: warnMsg, response: data });
                    continue;
                }

                const posts = data.data.children;
                
                // Filter posts by keywords if we're using new/hot endpoints (not search)
                // Search endpoint already filters by query, but new/hot don't
                let filteredPosts = posts;
                if (!successfulEndpoint.includes('search.json')) {
                    // Filter posts that match any keyword
                    const keywordLower = generatedKeywords.map(k => k.toLowerCase());
                    filteredPosts = posts.filter((child: any) => {
                        if (!child?.data) return false;
                        const post = child.data;
                        const titleLower = (post.title || '').toLowerCase();
                        const bodyLower = (post.selftext || '').toLowerCase();
                        const text = `${titleLower} ${bodyLower}`;
                        return keywordLower.some(keyword => text.includes(keyword));
                    });
                    console.log(`📊 Filtered ${filteredPosts.length} posts from ${posts.length} total for r/${sub} using keywords`);
                }
                
                diagnostics.postsFound += filteredPosts.length;

                for (const child of filteredPosts) {
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
                        status: 'new' as const,
                        intent: 'unclassified',
                        opportunityScore: score,
                        postedAt: new Date(post.created_utc * 1000), // Convert Unix timestamp to Date
                        type: 'DIRECT_LEAD' as const,
                        numComments: post.num_comments,
                        upvoteRatio: post.upvote_ratio
                    });
                }
            } catch (e: any) {
                const errorMsg = `Search failed for r/${sub}: ${e.message || e}`;
                console.error(errorMsg);
                diagnostics.errors.push({ subreddit: sub, error: errorMsg });
                // Continue with other subreddits even if one fails
            }
        }

        // Save leads to Prisma database (with fallback to in-memory)
        let savedCount = 0;
        let skippedCount = 0;
        let usedPrisma = false;
        
        // Try Prisma first if available and DATABASE_URL is set
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                usedPrisma = true;
                console.log('💾 Attempting to save leads to Prisma database...');
                
                // Use Prisma to save leads (upsert to avoid duplicates)
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
                                // Update existing lead
                                opportunityScore: lead.opportunityScore,
                                status: lead.status,
                                intent: lead.intent,
                            },
                            create: {
                                redditId: lead.redditId,
                                title: lead.title,
                                author: lead.author,
                                subreddit: lead.subreddit,
                                url: lead.url,
                                body: lead.body || null,
                                postedAt: lead.postedAt,
                                opportunityScore: lead.opportunityScore,
                                status: lead.status,
                                intent: lead.intent || null,
                                campaignId: campaignId,
                                userId: userId,
                                type: lead.type,
                            }
                        });
                        savedCount++;
                    } catch (error: any) {
                        // Skip duplicates or other errors
                        if (error.code === 'P2002') {
                            skippedCount++; // Duplicate
                        } else {
                            console.error(`Error saving lead ${lead.redditId}:`, error);
                        }
                    }
                }
                
                console.log(`💾 Saved ${savedCount} leads to Prisma database (${skippedCount} duplicates skipped)`);
                
                // Update campaign timestamp
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { lastManualDiscoveryAt: new Date() }
                });
                
                // Verify leads were saved
                const verifyLeads = await prisma.lead.count({
                    where: { campaignId: campaignId }
                });
                console.log(`✅ Verification: ${verifyLeads} total leads in Prisma database for ${campaignId}`);
                
            } catch (prismaError: any) {
                console.error('❌ Prisma error saving leads:', prismaError);
                usedPrisma = false;
                // Fall through to in-memory fallback
            }
        }
        
        // Fallback to in-memory database if Prisma failed or not available
        if (!usedPrisma) {
            console.log('⚠️ Using in-memory database (Prisma not available or failed)');
            const savedLeads = db.addLeads(campaignId, discoveredLeads.map(l => ({
                id: l.redditId,
                title: l.title,
                author: l.author,
                subreddit: l.subreddit,
                url: l.url,
                body: l.body || '',
                status: l.status,
                intent: l.intent || 'unclassified',
                opportunityScore: l.opportunityScore,
                createdAt: l.postedAt.getTime() / 1000,
                numComments: l.numComments || 0,
                upvoteRatio: l.upvoteRatio || 0
            })));
            db.updateCampaign(campaignId, { 
                lastManualDiscoveryAt: new Date().toISOString() 
            });
            savedCount = savedLeads.length;
            console.log(`💾 Saved ${savedCount} leads to in-memory database`);
        }

        // Check if all requests were blocked
        const allBlocked = diagnostics.errors.length > 0 && 
                          diagnostics.errors.every((e: any) => e.status === 403);
        
        // Count how many endpoints were tried
        const endpointsTried = diagnostics.subredditsSearched?.length || 0;
        const totalEndpointsAttempted = endpointsTried * 3; // 3 endpoints per subreddit
        
        // Ensure all data is serializable
        const responseData = {
            message: allBlocked 
                ? `Discovery complete but Reddit API blocked all ${totalEndpointsAttempted} endpoint attempts (403). Reddit blocks requests from cloud providers like Vercel. Solutions: 1) Use Reddit's official OAuth API (requires app registration), 2) Use a proxy service, or 3) Run discovery locally where it works.`
                : 'Discovery complete',
            count: discoveredLeads.length,
            diagnostics: {
                subredditsSearched: diagnostics.subredditsSearched,
                errors: diagnostics.errors,
                postsFound: diagnostics.postsFound,
                groqAvailable: diagnostics.groqAvailable,
                groqModel: diagnostics.groqModel,
                allBlocked: allBlocked,
                endpointsAttempted: totalEndpointsAttempted,
                note: allBlocked ? 'Reddit blocks cloud provider IPs. Consider using Reddit OAuth API or a proxy.' : undefined
            },
            subredditsSearched: Array.isArray(targetSubreddits) ? [...targetSubreddits] : [],
            keywordsUsed: Array.isArray(generatedKeywords) ? [...generatedKeywords] : []
        };

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error('Discovery route error:', error);
        const origin = request.headers.get('origin');
        return NextResponse.json(
            { 
                message: 'Discovery failed', 
                error: error.message || 'Unknown error occurred' 
            }, 
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}
