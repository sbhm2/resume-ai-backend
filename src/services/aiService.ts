import { getModel } from '../config/gemini';
import { AIAnalysisResult } from '../types';

export const analyzeResume = async (
    resumeText: string,
    jobDescription: string
): Promise<AIAnalysisResult> => {
    const hasJobDescription = jobDescription.trim().length > 0;

    const userMessage = `Analyze the following resume${hasJobDescription ? ' against the provided job description' : ' using industry best practices'}.

RESUME TEXT:
${resumeText}

${hasJobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}`;

    try {
        const model = getModel();
        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();

        // Remove any accidental markdown fences the model might add
        const cleaned = responseText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        const parsedData: AIAnalysisResult = JSON.parse(cleaned);
        return parsedData;
    } catch (error: any) {
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
};
