import geminiModel from '../config/gemini';
import { AIAnalysisResult } from '../types';

export const analyzeResume = async (
    resumeText: string, 
    jobDescription: string
): Promise<AIAnalysisResult> => {
    const prompt = `
    You are an expert ATS (Applicant Tracking System) analyzer and senior career coach.
    Analyze the following resume against the provided job description.
    
    Return STRICT JSON ONLY. Do not include markdown formatting like \`\`\`json.
    
    Required JSON structure:
    {
        "atsScore": number (0-100),
        "missingKeywords": [string],
        "resumeSuggestions": [string],
        "improvedBulletPoints": [string],
        "recommendedSkills": [string],
        "interviewQuestions": [string],
        "coverLetter": string (professional cover letter tailored to the job)
    }

    Resume Text:
    ${resumeText}

    Job Description:
    ${jobDescription}
    `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text();
        
        const parsedData: AIAnalysisResult = JSON.parse(responseText);
        return parsedData;
    } catch (error: any) {
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
};