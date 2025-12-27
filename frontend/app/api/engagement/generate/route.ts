import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { getGroqClient, isGroqError } from '@/lib/groq';
=======
import { generateText } from '@/lib/ai';
>>>>>>> landing/main

export async function POST(request: Request) {
    try {
        const { leadId, context, funMode } = await request.json();

<<<<<<< HEAD
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
=======
        const systemPrompt = `You are a helpful, knowledgeable human assistant engaging in a Reddit discussion. 
        Your goal is to write a comprehensive, high-value reply (approx 200-300 words).
        
        Style: ${funMode ? 'Casual, witty, and engaging' : 'Professional, thorough, and empathetic'}.
        
        Constraints:
        - Output STRICTLY PLAIN TEXT.
        - ABSOLUTELY NO Markdown formatting: NO bold (**), NO italics (*), NO headers (#), NO bullet points, NO numbered lists.
        - Do NOT use "1.", "2.", "3." lists. Use natural transition words (e.g., "First," "Additionally," "Finally").
        - Write approx 200-300 words in natural paragraphs.
        - Act like a real person sharing experience or advice, NOT an AI.
        - NO hashtags, NO emojis.
        - NO AI-speak (e.g., "I hope this helps", "As an AI").
        - If providing a solution, explain the 'why' and 'how' in detail using fluid sentences.
        - Be conversational but substantial.`;

        const replyContent = await generateText({
            system: systemPrompt,
            user: `Post Content: ${context}`,
            maxTokens: 800, // Increased for longer replies
        });

        if (!replyContent) {
            return NextResponse.json({
                error: "AI failed to generate a response. Please try again.",
                code: "GENERATION_ERROR"
>>>>>>> landing/main
            }, { status: 500 });
        }

        return NextResponse.json({ replies: [replyContent] });
    } catch (error: any) {
<<<<<<< HEAD
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
=======
        console.error("Reply Generation Error:", error.message || error);
        return NextResponse.json({
            error: "Failed to generate reply.",
            code: "INTERNAL_ERROR",
>>>>>>> landing/main
            details: error.message
        }, { status: 500 });
    }
}
