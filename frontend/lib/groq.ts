import Groq from 'groq-sdk';

/**
 * Creates a Groq client instance using the official SDK
 */
export function getGroqClient(): Groq | null {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey || apiKey === '') {
        console.warn('GROQ_API_KEY environment variable is not set');
        return null;
    }

    // Basic validation for Groq keys
    if (!apiKey.startsWith('gsk_')) {
        console.warn('Groq API key appears to be invalid format. Key should start with "gsk_".');
        return null;
    }

    try {
        return new Groq({
            apiKey
        });
    } catch (error) {
        console.error('Failed to create Groq client:', error);
        return null;
    }
}

/**
 * Checks if an error is an authentication/authorization error (401, 403)
 */
export function isGroqError(error: any): boolean {
    if (!error) return false;

    // Check for status code
    if (error.status === 401 || error.status === 403) {
        return true;
    }

    // Check error message
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('incorrect api key') ||
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('unauthorized')) {
        return true;
    }

    return false;
}

// Flag to prevent logging auth errors multiple times
let authErrorLogged = false;

/**
 * Handles Groq API errors gracefully
 * Returns a fallback value for scoring functions
 */
export function handleGroqError(error: any, fallback: number = 50): number {
    if (isGroqError(error)) {
        // Only log auth errors once to avoid spam
        if (!authErrorLogged) {
            console.warn('Groq API key is invalid or unauthorized. Using fallback scoring.');
            authErrorLogged = true;
        }
        return fallback;
    }

    // Log other errors but still return fallback
    console.error("Groq API Error:", error.message || error);
    return fallback;
}
