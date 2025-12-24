import { NextResponse } from 'next/server';
import { getGroqClient, isGroqError } from '@/lib/groq';

export async function POST(request: Request) {
    try {
        const { leadId, context, funMode } = await request.json();

        // Get Groq client at runtime to ensure env vars are loaded
        const groq = getGroqClient();
        const apiKey = process.env.GROQ_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({
                error: "Groq API key is missing. Please configure GROQ_API_KEY in your .env.local file and restart the server.",
                code: "GROQ_KEY_MISSING"
            }, { status: 503 });
        }

        if (!groq) {
            return NextResponse.json({
                error: "Groq API key format is invalid. Key should start with 'gsk_'.",
                code: "GROQ_KEY_INVALID_FORMAT"
            }, { status: 503 });
        }

        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama3-70b-8192",
            messages: [
                { role: "system", content: `You are a Reddit Engagement AI. Generate a professional and helpful reply to a Reddit post. ${funMode ? 'Make it slightly fun/humorous.' : ''}` },
                { role: "user", content: `Context or Post Content: ${context}` }
            ],
        });

        const replyContent = completion.choices[0].message.content;
        if (!replyContent) {
            return NextResponse.json({
                error: "Groq returned an empty response. Please try again.",
                code: "EMPTY_RESPONSE"
            }, { status: 500 });
        }

        return NextResponse.json({ replies: [replyContent] });
    } catch (error: any) {
        if (isGroqError(error)) {
            return NextResponse.json({
                error: "Groq API key is invalid or unauthorized. Please check your API key at https://console.groq.com/keys",
                code: "GROQ_AUTH_ERROR"
            }, { status: 401 });
        }

        console.error("Reply Generation Error:", error.message || error);
        return NextResponse.json({
            error: "Failed to generate reply. Please try again.",
            code: "GENERATION_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
