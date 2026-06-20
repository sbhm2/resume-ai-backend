import geminiModel from '../config/gemini';
import { AIAnalysisResult } from '../types';

export const analyzeResume = async (
    resumeText: string, 
    jobDescription: string
): Promise<AIAnalysisResult> => {
    const prompt = `
    You are an expert ATS (Applicant Tracking System) analyzer and senior career coach. You also structure resume text into a clean, parsed format.
    
    Analyze the following resume against the provided job description AND extract the resume into a structured JSON format.
    
    CRITICAL — DEDUPLICATION RULES:
    - Return exactly ONE improved bullet point for EACH original bullet point, in the SAME ORDER.
    - Return exactly ONE resume overall suggestion (the single most impactful improvement).
    - Do NOT return multiple suggestions for the same content.
    - Each suggestion must be for a distinct, unique section of the resume.
    
    Return STRICT JSON ONLY. Do not include markdown formatting like \`\`\`json.
    
    Required JSON structure:
    {
        "atsScore": number (0-100),
        "missingKeywords": [string],
        "resumeSuggestions": [string],
        "improvedBulletPoints": [string],
        "recommendedSkills": [string],
        "interviewQuestions": [string],
        "coverLetter": string (professional cover letter tailored to the job),
        "parsedResume": {
            "name": string (full name of candidate),
            "contact": string (email, phone, location, LinkedIn, GitHub all in one line),
            "summary": string (professional summary/skills overview),
            "experience": [
                {
                    "company": string,
                    "role": string,
                    "date": string,
                    "bullets": [string]
                }
            ],
            "skills": [string],
            "education": string (degrees, universities, dates)
        }
    }

    IMPORTANT — "improvedBulletPoints" must contain exactly ONE entry per original experience bullet point, and they MUST be in the exact order they appear across all experience entries (flattened, left-to-right). Do not repeat or duplicate any improvements.

    Extract the resume fields based on the raw text. If a section is missing from the resume, provide sensible defaults. For experience bullets, extract each bullet point as a separate array item.

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