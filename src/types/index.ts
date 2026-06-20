export interface ParsedExperience {
    company: string;
    role: string;
    date: string;
    bullets: string[];
}

export interface ParsedResumeData {
    name: string;
    contact: string;
    summary: string;
    experience: ParsedExperience[];
    skills: string[];
    education: string;
}

export interface AIAnalysisResult {
    atsScore: number;
    missingKeywords: string[];
    resumeSuggestions: string[];
    improvedBulletPoints: string[];
    recommendedSkills: string[];
    interviewQuestions: string[];
    coverLetter: string;
    parsedResume: ParsedResumeData;
}

export interface AnalyzeResumeSuccessResponse {
    success: true;
    requestId: string;
    generatedAt: string;
    data: AIAnalysisResult;
}