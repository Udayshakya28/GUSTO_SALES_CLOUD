import { NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { leadId, content } = await request.json();

        // 1. Validate Input
        if (!leadId || !content) {
            return NextResponse.json({ message: 'leadId and content are required' }, { status: 400 });
        }

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
                    const submission = r.getSubmission(leadId);
                    // @ts-ignore - TypeScript circular reference issue with snoowrap types
                    const reply = await submission.reply(content);
                    db.updateLeadStatus(leadId, 'replied');
                    return NextResponse.json({ message: 'Reply posted', redditId: reply.id });
                } catch (apiError: any) {
                    console.error("Devvit ID-based post failed", apiError);

                    // If it's a USER_REQUIRED error, return 401 instead of falling through
                    if (apiError.message && (apiError.message.includes("USER_REQUIRED") || apiError.message.includes("log in"))) {
                        return NextResponse.json({
                            message: 'Authentication failed: Reddit requires user context. The provided Devvit token may be expired or lack permissions.',
                            details: apiError.message
                        }, { status: 401 });
                    }

                    // For other errors, we might want to let it fall through or return error
                    return NextResponse.json({ message: `Failed to post reply with Devvit token: ${apiError.message}` }, { status: 500 });
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

                                const submission = r.getSubmission(leadId);
                                // @ts-ignore - TypeScript circular reference issue with snoowrap types
                                const reply = await submission.reply(content);
                                db.updateLeadStatus(leadId, 'replied');
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

        const submission = r.getSubmission(leadId);
        // @ts-ignore - TypeScript circular reference issue with snoowrap types
        const reply = await submission.reply(content);
        db.updateLeadStatus(leadId, 'replied');

        return NextResponse.json({
            message: 'Reply posted successfully',
            redditId: reply.id
        });

    } catch (error: any) {
        console.error("Post Error:", error);
        return NextResponse.json({ message: `Failed to post reply: ${error.message}` }, { status: 500 });
    }
}
