import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export async function POST(
    request: Request,
    context: { params: Promise<{ leadId: string }> }
) {
    try {
        const { content } = await request.json();

        // Await context params (Next.js 15 requirement)
        await context.params;

        if (!content) {
            return NextResponse.json({ summary: "No content provided to summarize." });
        }

        const systemPrompt = `You are a helpful human narrator. Summarize the following Reddit post in detail (approx 200-300 words). 
        Explain the key points, the user's specific problem/context, and any opportunities.
        Write as if you are explaining it to a busy colleague who needs the full picture without reading the original post. 
        
        Constraints:
        - Output STRICTLY PLAIN TEXT.
        - ABSOLUTELY NO Markdown formatting: NO bold (**), NO italics, NO headers, NO bullet points.
        - Write approx 200-300 words in natural paragraphs.`;

        const summary = await generateText({
            system: systemPrompt,
            user: content,
            maxTokens: 800
        });

        if (!summary) {
            return NextResponse.json({
                summary: "AI Summary Unavailable (Generation failed). Please try again."
            });
        }

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error("Summary Generation Error:", error.message || error);
        return NextResponse.json({
            summary: "Could not generate summary. Please try again."
        });
    }
}
