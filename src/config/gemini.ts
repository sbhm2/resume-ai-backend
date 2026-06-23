import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

let cachedModel: ReturnType<typeof createModel> | null = null;

function createModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing from environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
}

/**
 * Returns the Gemini model instance, initialising it lazily on first call.
 * This avoids crashing the serverless function at cold-start when env vars
 * are not yet available (e.g. during build or pre-deployment).
 */
export function getModel() {
    if (!cachedModel) {
        cachedModel = createModel();
    }
    return cachedModel;
}

export default getModel;