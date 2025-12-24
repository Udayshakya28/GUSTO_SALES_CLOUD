import { NextResponse } from 'next/server';
import { getGroqClient, isGroqError } from '@/lib/groq';

export async function POST(request: Request) {
    let originalReply: string = "";

    try {
        const requestData = await request.json();
        originalReply = requestData.originalReply || "";
        const { instruction } = requestData;

        if (!originalReply) {
            return NextResponse.json({
                error: "Original reply text is required for refinement.",
                code: "MISSING_ORIGINAL_REPLY"
            }, { status: 400 });
        }

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
                { role: "system", content: "You are an AI editor for Reddit replies. Refine the original reply based on the instruction provided." },
                { role: "user", content: `Original: ${ originalReply } \nInstruction: ${ instruction } ` }
            ],
        });

        const refinedContent = completion.choices[0].message.content;
        if (!refinedContent) {
            return NextResponse.json({
                error: "Groq returned an empty response. Please try again.",
                code: "EMPTY_RESPONSE"
            }, { status: 500 });
        }

        return NextResponse.json({ refinedReply: refinedContent });
    } catch (error: any) {
        if (isGroqError(error)) {
            return NextResponse.json({
                error: "Groq API key is invalid or unauthorized. Please check your API key at https://console.groq.com/keys",
                code: "GROQ_AUTH_ERROR"
            }, { status: 401 });
        }

        console.error("Reply Refinement Error:", error.message || error);
        return NextResponse.json({
            error: "Failed to refine reply. Please try again.",
            code: "REFINEMENT_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
