import { NextResponse } from 'next/server';
import Snoowrap from 'snoowrap';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // Check if DEVVIT_TOKEN is configured
        const devvitToken = process.env.DEVVIT_TOKEN;
        
        if (!devvitToken) {
            return NextResponse.json({
                connected: false,
                method: 'devvit',
                message: 'DEVVIT_TOKEN not configured'
            });
        }

        // Try to parse and validate the token
        try {
            let tokenStr = devvitToken.trim();
            // Remove potential wrapping quotes from .env value
            if ((tokenStr.startsWith("'") && tokenStr.endsWith("'")) || (tokenStr.startsWith('"') && tokenStr.endsWith('"'))) {
                tokenStr = tokenStr.slice(1, -1);
            }

            const tokenContainer = JSON.parse(tokenStr);
            if (!tokenContainer.token) {
                return NextResponse.json({
                    connected: false,
                    method: 'devvit',
                    message: 'Invalid DEVVIT_TOKEN format',
                    error: 'Token container missing token field'
                });
            }

            const decodedBytes = Buffer.from(tokenContainer.token, 'base64');
            const decodedString = decodedBytes.toString('utf-8');
            const innerToken = JSON.parse(decodedString);

            if (!innerToken.accessToken) {
                return NextResponse.json({
                    connected: false,
                    method: 'devvit',
                    message: 'Invalid DEVVIT_TOKEN format',
                    error: 'Missing accessToken in decoded token'
                });
            }

            // Try to create Snoowrap instance to verify token
            const userAgent = process.env.REDDIT_USER_AGENT || "RedLead/1.0.0";
            const r = new Snoowrap({
                userAgent,
                accessToken: innerToken.accessToken,
                refreshToken: innerToken.refreshToken,
                clientId: 'Bep8X2RRjuoyuxkKsKxFuQ',
                clientSecret: ''
            });

            // Try to get user info to verify token is valid
            try {
                const me = await r.getMe();
                return NextResponse.json({
                    connected: true,
                    method: 'devvit',
                    username: me.name,
                    karma: me.total_karma || 0,
                    verified: me.has_verified_email || false,
                    message: 'DEVVIT_TOKEN is configured and valid'
                });
            } catch (apiError: any) {
                return NextResponse.json({
                    connected: false,
                    method: 'devvit',
                    message: 'DEVVIT_TOKEN configured but invalid or expired',
                    error: apiError.message || 'Failed to verify token with Reddit API'
                });
            }
        } catch (parseError: any) {
            return NextResponse.json({
                connected: false,
                method: 'devvit',
                message: 'Failed to parse DEVVIT_TOKEN',
                error: parseError.message || 'Invalid token format'
            });
        }
    } catch (error: any) {
        return NextResponse.json({
            connected: false,
            method: 'devvit',
            message: 'Error checking Reddit connection status',
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

