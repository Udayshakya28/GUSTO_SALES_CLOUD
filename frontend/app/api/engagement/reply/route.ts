import { NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';
import { db } from '@/lib/db';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { leadId, redditId, content } = await request.json();

        // 1. Validate Input
        if (!content) {
            return NextResponse.json({ message: 'content is required' }, { status: 400 });
        }
        
        // Determine the Reddit post ID to reply to
        // redditId takes precedence (direct Reddit post ID), otherwise fetch from database
        let postId = redditId;
        
        if (!postId && leadId) {
            // Try to fetch redditId from database
            console.log(`🔍 Looking up redditId for leadId: ${leadId}`);
            
            // Try Prisma first
            if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
                try {
                    const lead = await prisma.lead.findUnique({
                        where: { id: leadId },
                        select: { redditId: true }
                    });
                    
                    if (lead && lead.redditId) {
                        postId = lead.redditId;
                        console.log(`✅ Found redditId in Prisma: ${postId}`);
                    }
                } catch (e: any) {
                    console.warn(`⚠️ Prisma lookup failed: ${e.message}`);
                }
            }
            
            // Fallback to in-memory database
            if (!postId) {
                // Search through all campaigns' leads to find the lead
                const allLeads = db.getCampaigns().flatMap(campaign => db.getLeads(campaign.id));
                const lead = allLeads.find(l => l.id === leadId);
                if (lead && (lead as any).redditId) {
                    postId = (lead as any).redditId;
                    console.log(`✅ Found redditId in in-memory DB: ${postId}`);
                }
            }
        }
        
        if (!postId) {
            return NextResponse.json({ 
                message: 'Could not determine Reddit post ID. Please provide redditId or a valid leadId.',
                leadId: leadId,
                redditId: redditId
            }, { status: 400 });
        }
        
        console.log(`📝 Attempting to reply to Reddit post: ${postId} (leadId: ${leadId}, redditId: ${redditId})`);

        // 2. Resolve Credentials
        let clientId = process.env.REDDIT_CLIENT_ID;
        let clientSecret = process.env.REDDIT_CLIENT_SECRET;
        let refreshToken = process.env.REDDIT_REFRESH_TOKEN;
        const userAgent = process.env.REDDIT_USER_AGENT || "RedLead/1.0.0";

        // Check for DEVVIT_TOKEN environment variable (Vercel/Cloud deployment)
        if (process.env.DEVVIT_TOKEN) {
            let r: Snoowrap | null = null;
            try {
                let tokenStr = process.env.DEVVIT_TOKEN.trim();
                // Remove potential wrapping quotes from .env value
                if ((tokenStr.startsWith("'") && tokenStr.endsWith("'")) || (tokenStr.startsWith('"') && tokenStr.endsWith('"'))) {
                    tokenStr = tokenStr.slice(1, -1);
                }

                const tokenContainer = JSON.parse(tokenStr);
                if (tokenContainer.token) {
                    const decodedBytes = Buffer.from(tokenContainer.token, 'base64');
                    const decodedString = decodedBytes.toString('utf-8');
                    const innerToken = JSON.parse(decodedString);

                    if (innerToken.accessToken) {
                        r = new Snoowrap({
                            userAgent,
                            accessToken: innerToken.accessToken,
                            refreshToken: innerToken.refreshToken, // Attempt to pass refresh token if available
                            clientId: 'Bep8X2RRjuoyuxkKsKxFuQ', // Public Devvit CLI Client ID required for auth context
                            clientSecret: '' // Installed apps don't use secrets
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to parse DEVVIT_TOKEN env var", e);
            }

            if (r) {
                try {
                    // Verify token is valid by getting user info first
                    try {
                        // Break circular reference by casting to any (same pattern as reddit/status route)
                        const rAny = r as any;
                        const me = await rAny.getMe();
                        console.log(`✅ Authenticated as Reddit user: ${me.name}`);
                    } catch (authError: any) {
                        console.error("❌ Token validation failed:", authError.message);
                        return NextResponse.json({
                            message: 'Reddit authentication failed. The DEVVIT_TOKEN may be expired or invalid.',
                            details: authError.message,
                            error: authError.statusCode || authError.status || 'AUTH_ERROR'
                        }, { status: 401 });
                    }
                    
                    // Get the submission - postId should be the Reddit post ID (e.g., "1abc2de")
                    // Remove "t3_" prefix if present (Reddit fullname format)
                    const cleanPostId = postId.replace(/^t3_/, '');
                    console.log(`📤 Replying to Reddit post ID: ${cleanPostId}`);
                    
                    const submission = r.getSubmission(cleanPostId);
                    // @ts-ignore - TypeScript circular reference issue with snoowrap types
                    const reply = await submission.reply(content);
                    
                    console.log(`✅ Reply posted successfully: ${reply.id}`);
                    
                    // Update lead status if leadId was provided
                    if (leadId) {
                        try {
                            // Try Prisma first
                            if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
                                await prisma.lead.update({
                                    where: { id: leadId },
                                    data: { status: 'replied' }
                                });
                                console.log(`✅ Updated lead ${leadId} status to 'replied' in Prisma`);
                            }
                            // Also update in-memory for consistency
                            db.updateLeadStatus(leadId, 'replied');
                        } catch (statusError: any) {
                            console.error(`⚠️ Failed to update lead status: ${statusError.message}`);
                            // Don't fail the whole request if status update fails
                        }
                    }
                    
                    return NextResponse.json({ 
                        message: 'Reply posted successfully', 
                        redditId: reply.id,
                        postId: cleanPostId
                    });
                } catch (apiError: any) {
                    const errorMessage = apiError.message || apiError.error?.message || String(apiError.error || apiError);
                    console.error("❌ Devvit ID-based post failed", {
                        error: errorMessage,
                        statusCode: apiError.statusCode || apiError.status,
                        postId: postId,
                        cleanPostId: postId.replace(/^t3_/, ''),
                        errorDetails: apiError.error || apiError.response?.body || apiError
                    });

                    // Handle Reddit's AI content detection (COMMENT_GUIDANCE_VALIDATION_FAILED)
                    if (errorMessage.includes('COMMENT_GUIDANCE_VALIDATION_FAILED') || 
                        errorMessage.includes('AI-generated') || 
                        errorMessage.includes('AI-polished')) {
                        return NextResponse.json({
                            message: 'Reddit detected AI-generated content and blocked the reply. Reddit\'s policy prohibits AI-generated or AI-polished comments. Please edit the reply to make it more personal and human-written before posting.',
                            details: errorMessage,
                            error: 'AI_CONTENT_DETECTED',
                            suggestion: 'Try editing the reply to add personal touches, remove AI-like phrasing, or write it yourself.',
                            postId: postId
                        }, { status: 400 });
                    }
                    
                    // Handle specific error types
                    if (apiError.statusCode === 403 || apiError.status === 403) {
                        return NextResponse.json({
                            message: 'Forbidden: Reddit rejected the reply. This may be due to insufficient permissions, rate limiting, or the post being locked/deleted.',
                            details: errorMessage,
                            error: 'FORBIDDEN',
                            postId: postId
                        }, { status: 403 });
                    }
                    
                    if (apiError.statusCode === 401 || apiError.status === 401) {
                        return NextResponse.json({
                            message: 'Authentication failed: Reddit requires user context. The provided Devvit token may be expired or lack permissions.',
                            details: errorMessage,
                            error: 'AUTH_FAILED'
                        }, { status: 401 });
                    }
                    
                    // If it's a USER_REQUIRED error, return 401 instead of falling through
                    if (errorMessage.includes("USER_REQUIRED") || errorMessage.includes("log in")) {
                        return NextResponse.json({
                            message: 'Authentication failed: Reddit requires user context. The provided Devvit token may be expired or lack permissions.',
                            details: errorMessage,
                            error: 'USER_REQUIRED'
                        }, { status: 401 });
                    }

                    // For other errors, return detailed error
                    return NextResponse.json({ 
                        message: `Failed to post reply: ${errorMessage || 'Unknown error'}`,
                        details: apiError.error || apiError.response?.body,
                        error: apiError.statusCode || apiError.status || 'UNKNOWN_ERROR',
                        postId: postId
                    }, { status: apiError.statusCode || apiError.status || 500 });
                }
            }
        }

        // Try to load from devvit_token.json if env vars are missing (Local Development)
        if (!clientId || !refreshToken) {
            try {
                // Look in project root (shubhamdevlead)
                // CWD is usually .../RedLead/frontend
                // ../../ points to .../shubhamdevlead
                const tokenPath = path.resolve(process.cwd(), '../../devvit_token.json');

                if (fs.existsSync(tokenPath)) {
                    const fileContent = fs.readFileSync(tokenPath, 'utf8');
                    const tokenContainer = JSON.parse(fileContent);

                    // The 'token' field is a Base64 encoded string containing the actual credentials
                    if (tokenContainer.token) {
                        try {
                            const decodedBytes = Buffer.from(tokenContainer.token, 'base64');
                            const decodedString = decodedBytes.toString('utf-8');
                            const innerToken = JSON.parse(decodedString);

                            if (innerToken.accessToken) {
                                const r = new Snoowrap({
                                    userAgent,
                                    accessToken: innerToken.accessToken
                                });

                                const cleanPostId = postId.replace(/^t3_/, '');
                                const submission = r.getSubmission(cleanPostId);
                                // @ts-ignore - TypeScript circular reference issue with snoowrap types
                                const reply = await submission.reply(content);
                                if (leadId) {
                                    try {
                                        // Try Prisma first
                                        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
                                            await prisma.lead.update({
                                                where: { id: leadId },
                                                data: { status: 'replied' }
                                            });
                                        }
                                        // Also update in-memory for consistency
                                        db.updateLeadStatus(leadId, 'replied');
                                    } catch (statusError: any) {
                                        console.error(`⚠️ Failed to update lead status: ${statusError.message}`);
                                    }
                                }
                                return NextResponse.json({ message: 'Reply posted', redditId: reply.id });
                            }
                        } catch (parseError) {
                            console.error("Failed to parse inner token from devvit_token.json", parseError);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load devvit_token.json", e);
            }
        }

        // Only enforce standard credentials if Devvit token method failed
        if (!clientId || !clientSecret || !refreshToken) {

            return NextResponse.json({
                message: 'Credentials missing. Please run find_token.ps1 to import your Devvit session.'
            }, { status: 500 });
        }

        // 3. Initialize Snoowrap (Standard Env Var Fallback)
        const r = new Snoowrap({
            userAgent,
            clientId,
            clientSecret,
            refreshToken,
        });

        const cleanPostId = postId.replace(/^t3_/, '');
        const submission = r.getSubmission(cleanPostId);
        // @ts-ignore - TypeScript circular reference issue with snoowrap types
        const reply = await submission.reply(content);
        if (leadId) {
            try {
                // Try Prisma first
                if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
                    await prisma.lead.update({
                        where: { id: leadId },
                        data: { status: 'replied' }
                    });
                }
                // Also update in-memory for consistency
                db.updateLeadStatus(leadId, 'replied');
            } catch (statusError: any) {
                console.error(`⚠️ Failed to update lead status: ${statusError.message}`);
            }
        }

        return NextResponse.json({
            message: 'Reply posted successfully',
            redditId: reply.id
        });

    } catch (error: any) {
        console.error("Post Error:", error);
        return NextResponse.json({ message: `Failed to post reply: ${error.message}` }, { status: 500 });
    }
}
