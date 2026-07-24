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
    // === Core fields (always present, filled for both scenarios) ===
    atsScore: number;
    missingKeywords: string[];
    resumeSuggestions: string[];
    improvedBulletPoints: string[];
    recommendedSkills: string[];
    interviewQuestions: string[];
    coverLetter: string;
    parsedResume: ParsedResumeData;

    // === New — shared across both scenarios ===
    resumeStrengths: string[];
    resumeWeaknesses: string[];
    finalSummary: string;
    overallResumeScore: number;

    // === New — resume-only review fields ===
    resumeQualityScore: number;
    atsFriendlinessScore: number;
    resumeStructureReview: string;
    formattingSuggestions: string[];
    contentQualityReview: string;
    missingTechnicalSkills: string[];
    missingSoftSkills: string[];
    weakBulletPoints: string[];
    suggestedBulletPointImprovements: string[];
    suggestedCareerRoles: string[];
    suggestedTechnologiesToLearn: string[];
    professionalSummaryImprovements: string;
    overallRecommendation: string;
}

export interface AnalyzeResumeSuccessResponse {
    success: true;
    requestId: string;
    generatedAt: string;
    data: AIAnalysisResult;
}