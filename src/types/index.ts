export interface AIAnalysisResult {
    atsScore: number;
    missingKeywords: string[];
    resumeSuggestions: string[];
    improvedBulletPoints: string[];
    recommendedSkills: string[];
    interviewQuestions: string[];
    coverLetter: string;
}

export interface AnalyzeResumeSuccessResponse {
    success: true;
    requestId: string;
    generatedAt: string;
    data: AIAnalysisResult;
}