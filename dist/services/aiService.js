"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = void 0;
const gemini_1 = __importDefault(require("../config/gemini"));
const analyzeResume = async (resumeText, jobDescription) => {
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
        const result = await gemini_1.default.generateContent(prompt);
        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);
        return parsedData;
    }
    catch (error) {
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
};
exports.analyzeResume = analyzeResume;
