import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { db } from '@/lib/db';
import { getGroqClient, isGroqError } from '@/lib/groq';
=======
import { generateText } from '@/lib/ai';
>>>>>>> landing/main

export async function POST(
    request: Request,
    context: { params: Promise<{ leadId: string }> }
) {
    try {
        const { content } = await request.json();
<<<<<<< HEAD
        const { leadId } = await context.params;

        // Get Groq client at runtime to ensure env vars are loaded
        const groq = getGroqClient();

        // Check for API key at runtime to ensure it's loaded
        const apiKey = process.env.GROQ_API_KEY?.trim();
        if (!apiKey) {
            console.error('GROQ_API_KEY is not set in environment variables');
            return NextResponse.json({
                summary: "AI Summary Unavailable (Groq API key not configured. Please set GROQ_API_KEY in your .env.local file and restart the server)"
            });
        }

        if (!groq) {
            return NextResponse.json({
                summary: "AI Summary Unavailable (Groq API key format is invalid. Key should start with 'gsk_')"
            });
        }
=======

        // Await context params (Next.js 15 requirement)
        await context.params;
>>>>>>> landing/main

        if (!content) {
            return NextResponse.json({ summary: "No content provided to summarize." });
        }

<<<<<<< HEAD
        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama3-70b-8192",
            messages: [
                { role: "system", content: "You are a helpful assistant. Summarize the following Reddit post content in 1-2 concise sentences, focusing on the main point or opportunity." },
                { role: "user", content: content }
            ],
            max_tokens: 100,
        });

        const summary = completion.choices[0].message.content || "Could not generate summary.";
=======
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
>>>>>>> landing/main

        return NextResponse.json({ summary });

    } catch (error: any) {
<<<<<<< HEAD
        // Handle authentication errors gracefully
        if (isGroqError(error)) {
            console.error('Groq API authentication error:', error.message || error);
            return NextResponse.json({
                summary: "AI Summary Unavailable (Groq API key is invalid or expired. Please check your API key at https://console.groq.com/keys)"
            });
        }

=======
>>>>>>> landing/main
        console.error("Summary Generation Error:", error.message || error);
        return NextResponse.json({
            summary: "Could not generate summary. Please try again."
        });
    }
}
