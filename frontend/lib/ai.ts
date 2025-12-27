import OpenAI from 'openai';
import { getGroqClient, handleGroqError } from './groq';

// Initialize OpenAI client
const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
};

interface AIRequest {
    system?: string;
    user: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    json?: boolean;
}

/**
 * Generates text using OpenAI with fallback to Groq.
 * Prioritizes OpenAI (GPT-4o-mini or specified model).
 */
export async function generateText(request: AIRequest): Promise<string | null> {
    const openai = getOpenAIClient();
    const systemPrompt = request.system || "You are a helpful AI assistant.";

    // 1. Try OpenAI
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: request.model || "gpt-4o-mini", // Default to fast/cheap GPT-4o-mini
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: request.user }
                ],
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 1000,
                response_format: request.json ? { type: "json_object" } : undefined
            });

            return completion.choices[0].message.content;
        } catch (e: any) {
            console.warn("⚠️ OpenAI failed, falling back to Groq:", e.message);
            // Fall through to Groq
        }
    } else {
        console.log("ℹ️ No OpenAI API key found, defaulting to Groq.");
    }

    // 2. Fallback to Groq
    const groq = getGroqClient();
    if (!groq) {
        console.error("❌ Both OpenAI and Groq clients unavailable.");
        return null;
    }

    try {
        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: request.user }
            ],
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 1000,
            response_format: request.json ? { type: "json_object" } : undefined
        });

        return completion.choices[0].message.content;
    } catch (e: any) {
        console.error("❌ Groq also failed:", e.message);
        return null;
    }
}

/**
 * Helper to generate a score (0-100) specifically for leads.
 * Returns a number.
 */
/**
 * Helper to generate a score (0-100) and intent classification.
 * Returns { score: number, intent: string }.
 */
export async function generateScore(title: string, body: string, keywords: string[]): Promise<{ score: number, intent: string }> {
    // Check against keywords first to avoid using AI for obvious mismatches
    const lowerTitle = title.toLowerCase();
    const lowerBody = body.toLowerCase();

    // Basic relevance check - if NONE of the keywords appear as tokens, return 0 (save AI credits)
    // This is a rough check, AI is better at semantic matching, but we want to optimize.
    // We'll trust the wrapper to have done some filtering, but just in case.

    const system = `You are an expert sales lead analyzer. 
  Your task is to analyze a Reddit post and return a JSON object with a score (0-100) and an intent classification.
  
  Keywords: ${keywords.join(', ')}
  
  Scoring Criteria:
  - 90-100: High intent. Explicitly asking for the product/service or describing the exact problem it solves. "I need...", "Looking for..."
  - 70-89: Moderate intent. Relevant topic, asking questions, seeking advice.
  - 40-69: Loose relevance. Mentions keywords but in a general discussion.
  - 0-39: Irrelevant, spam, or totally different context.

  Intent Categories:
  - "Buying": Wants to purchase or find a solution.
  - "Seeking Advice": Asking for help/information related to the problem.
  - "Discussing": General conversation, sharing opinion.
  - "Selling": Promoting their own stuff (Competitor or irrelevant).
  - "Unrelated": Not relevant.
  
  Return ONLY a JSON object: { "score": number, "intent": "string", "reason": "short explanation" }`;

    const user = `Title: ${title}\n\nBody: ${body.substring(0, 1000)}`;

    try {
        const response = await generateText({
            system,
            user,
            json: true,
            maxTokens: 800, // Increased to prevent Groq cutoffs
            temperature: 0.1
        });

        if (!response) {
            console.warn("⚠️ Score generation returned null/empty");
            return { score: 50, intent: 'unclassified' };
        }

        let data;
        try {
            // First try strict parse
            data = JSON.parse(response);
        } catch (initialError) {
            // Fallback: extract JSON from markdown/text
            const match = response.match(/\{[\s\S]*\}/);
            if (match) {
                data = JSON.parse(match[0]);
            } else {
                throw new Error("No JSON found in response");
            }
        }

        return {
            score: typeof data.score === 'number' ? data.score : 50,
            intent: typeof data.intent === 'string' ? data.intent : 'unclassified'
        };
    } catch (e: any) {
        console.error("❌ Error generating score:", e.message);
        return { score: 50, intent: 'unclassified' };
    }
}
