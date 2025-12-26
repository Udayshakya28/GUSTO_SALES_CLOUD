import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

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

        const systemPrompt = `You are an expert AI editor. Refine the following Reddit reply based on the user's instruction.
        
        Goal: Create a substantial, human-like response (approx 200-300 words).
        
        Constraints:
        - Output STRICTLY PLAIN TEXT.
        - ABSOLUTELY NO Markdown formatting: NO bold (**), NO italics (*), NO headers.
        - Write approx 200-300 words in natural paragraphs.
        - Style: Natural, conversational, helpful.
        - NO hashtags, NO emojis.
        - NO AI-speak.
        - Maintain the helpful core message but expand on details if needed.`;

        const refinedContent = await generateText({
            system: systemPrompt,
            user: `Original: ${originalReply} \nInstruction: ${instruction}`,
            maxTokens: 800
        });

        if (!refinedContent) {
            return NextResponse.json({
                error: "AI failed to refine the response. Please try again.",
                code: "GENERATION_ERROR"
            }, { status: 500 });
        }

        return NextResponse.json({ refinedReply: refinedContent });
    } catch (error: any) {
        console.error("Reply Refinement Error:", error.message || error);
        return NextResponse.json({
            error: "Failed to refine reply.",
            code: "INTERNAL_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
