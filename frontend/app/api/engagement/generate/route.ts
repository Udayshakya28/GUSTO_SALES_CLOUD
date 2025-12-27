import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const { leadId, context, funMode } = await request.json();

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
            }, { status: 500 });
        }

        return NextResponse.json({ replies: [replyContent] });
    } catch (error: any) {
        console.error("Reply Generation Error:", error.message || error);
        return NextResponse.json({
            error: "Failed to generate reply.",
            code: "INTERNAL_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
