import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AIAnalysisResult } from '../types';
import { computeHash, applyPatch } from '../utils/diff';

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const analyses = await prisma.resumeAnalysis.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: { id: true, jobDescription: true, resumeFileName: true, atsScore: true, createdAt: true }
        });

        const total = await prisma.resumeAnalysis.count({ where: { userId: req.user!.id } });

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};

export const getAnalysisById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const analysis = await prisma.resumeAnalysis.findUnique({
            where: { id: req.params.id }
        });

        if (!analysis || analysis.userId !== req.user!.id) {
            res.status(404).json({ success: false, error: 'Analysis not found or unauthorized' });
            return;
        }

        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        next(error);
    }
};

export const deleteAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const analysis = await prisma.resumeAnalysis.findUnique({
            where: { id: req.params.id }
        });

        if (!analysis || analysis.userId !== req.user!.id) {
            res.status(404).json({ success: false, error: 'Analysis not found or unauthorized' });
            return;
        }

        await prisma.resumeAnalysis.delete({ where: { id: req.params.id } });

        res.status(200).json({ success: true, message: 'Analysis deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { start: todayStart, end: todayEnd } = getTodayRange();

        // Total analyses count
        const totalAnalyses = await prisma.resumeAnalysis.count({
            where: { userId }
        });

        // Today's analyses count
        const todayAnalyses = await prisma.resumeAnalysis.count({
            where: {
                userId,
                createdAt: { gte: todayStart, lte: todayEnd }
            }
        });

        // Average ATS score
        const avgResult = await prisma.resumeAnalysis.aggregate({
            where: { userId },
            _avg: { atsScore: true }
        });
        const averageAtsScore = Math.round(avgResult._avg.atsScore || 0);

        // Daily usage tracking
        const todayUsage = await prisma.usageTracking.findUnique({
            where: { userId_date: { userId, date: todayStart } }
        });
        const dailyUsageCount = todayUsage?.analysisCount || 0;

        // Recent 5 analyses
        const recentAnalyses = await prisma.resumeAnalysis.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                resumeFileName: true,
                atsScore: true,
                jobDescription: true,
                createdAt: true
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalAnalyses,
                todayAnalyses,
                dailyUsageCount,
                dailyLimit: 5,
                averageAtsScore,
                recentAnalyses
            }
        });
    } catch (error) {
        next(error);
    }
};

export const saveDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { mode } = req.body;

        const analysis = await prisma.resumeAnalysis.findUnique({
            where: { id: req.params.id }
        });

        if (!analysis || analysis.userId !== req.user!.id) {
            res.status(404).json({ success: false, error: 'Analysis not found or unauthorized' });
            return;
        }

        const analysisJson = analysis.analysisJson as Record<string, unknown>;
        let newDraftData: unknown;

        if (mode === 'full') {
            // Full payload — first save or fallback
            const { workingResume } = req.body;
            if (!workingResume) {
                res.status(400).json({ success: false, error: 'workingResume is required for full mode' });
                return;
            }
            newDraftData = workingResume;
        } else if (mode === 'patch') {
            // Incremental diff — only changed fields
            const { baseHash, ops } = req.body;

            if (!ops || !Array.isArray(ops)) {
                res.status(400).json({ success: false, error: 'ops array is required for patch mode' });
                return;
            }

            const existingDraft = (analysisJson as Record<string, unknown>).draftData;

            // Validate base hash matches what server has stored
            if (existingDraft && baseHash) {
                const serverHash = computeHash(existingDraft);
                if (serverHash !== baseHash) {
                    res.status(409).json({
                        success: false,
                        error: 'Stale draft — base hash mismatch. Sending full state required.',
                        serverHash,
                    });
                    return;
                }
            }

            // Apply patch to reconstruct full state
            if (!existingDraft) {
                // No previous draft — can't patch, need full
                res.status(400).json({
                    success: false,
                    error: 'No existing draft found. Send full payload instead.',
                });
                return;
            }

            newDraftData = applyPatch(existingDraft, ops);
        } else {
            res.status(400).json({ success: false, error: 'mode must be "full" or "patch"' });
            return;
        }

        // Persist suggestion statuses if provided
        const { suggestionStatuses } = req.body;

        // Merge draft data and suggestion statuses into the existing analysisJson
        const updatedJson: Record<string, unknown> = { ...analysisJson, draftData: newDraftData };
        if (suggestionStatuses && typeof suggestionStatuses === 'object') {
            updatedJson.suggestionStatuses = suggestionStatuses;
        }

        await prisma.resumeAnalysis.update({
            where: { id: req.params.id },
            data: { analysisJson: updatedJson as any }
        });

        res.status(200).json({ success: true, message: 'Draft saved successfully' });
    } catch (error) {
        next(error);
    }
};

export const getEditorData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const analysis = await prisma.resumeAnalysis.findUnique({
            where: { id: req.params.id }
        });

        if (!analysis || analysis.userId !== req.user!.id) {
            res.status(404).json({ success: false, error: 'Analysis not found or unauthorized' });
            return;
        }

        const analysisJson = analysis.analysisJson as Record<string, unknown>;
        
        // Check for saved draft data first (from previous edits)
        const existingDraft = analysisJson.draftData as Record<string, unknown> | undefined;
        
        const aiData = analysisJson as unknown as AIAnalysisResult;
        
        if (!aiData.parsedResume) {
            res.status(404).json({ success: false, error: 'Parsed resume data not found in this analysis. Please re-run the analysis.' });
            return;
        }

        // Use saved draft if available, otherwise reconstruct from analysis
        const resumeData = existingDraft ? {
            name: existingDraft.name as string,
            contact: existingDraft.contact as string,
            summary: existingDraft.summary as string,
            experience: (existingDraft.experience as Array<Record<string, unknown>>).map((exp, idx) => ({
                id: (exp.id as string) || `exp${idx + 1}`,
                company: exp.company as string,
                role: exp.role as string,
                date: exp.date as string,
                bullets: exp.bullets as string[]
            })),
            skills: existingDraft.skills as string[],
            education: existingDraft.education as string
        } : {
            name: aiData.parsedResume.name,
            contact: aiData.parsedResume.contact,
            summary: aiData.parsedResume.summary,
            experience: aiData.parsedResume.experience.map((exp, idx) => ({
                id: `exp${idx + 1}`,
                company: exp.company,
                role: exp.role,
                date: exp.date,
                bullets: exp.bullets
            })),
            skills: aiData.parsedResume.skills,
            education: aiData.parsedResume.education
        };

        // Check for saved suggestion statuses
        const savedStatuses = (analysisJson.suggestionStatuses as Record<string, string> | undefined) || {};

        // Construct suggestions from the analysis data
        const suggestions: {
            id: string;
            type: 'bullet' | 'skill' | 'keyword' | 'summary';
            sectionId?: string;
            itemIndex?: number;
            original: string;
            suggested: string;
            status: 'pending' | 'accepted' | 'rejected';
            title: string;
            sectionLabel: string;
        }[] = [];

        let sId = 1;

        // Resume suggestions as summary improvements (take at most 1)
        const bestSummarySuggestion = aiData.resumeSuggestions[0];
        if (bestSummarySuggestion) {
            const sId_str = `s${sId++}`;
            suggestions.push({
                id: sId_str,
                type: 'summary',
                original: resumeData.summary,
                suggested: bestSummarySuggestion,
                status: (savedStatuses[sId_str] as 'pending' | 'accepted' | 'rejected') || 'pending',
                title: 'Professional Summary Enhancement',
                sectionLabel: 'Professional Summary'
            });
        }

        // Improved bullet points — map 1:1 to the flattened list of all original bullets
        // Collect all original bullets with their (expId, bulletIndex) positions, flattened
        const originalBulletMap: { sectionId: string; itemIndex: number; text: string; sectionLabel: string }[] = [];
        for (const exp of resumeData.experience) {
            exp.bullets.forEach((bulletText, bIdx) => {
                originalBulletMap.push({
                    sectionId: exp.id,
                    itemIndex: bIdx,
                    text: bulletText,
                    sectionLabel: `${exp.role ? exp.role + ' — ' : ''}${exp.company || 'Experience'}`
                });
            });
        }

        aiData.improvedBulletPoints.forEach((bullet: string, idx: number) => {
            const originalEntry = originalBulletMap[idx];
            if (originalEntry) {
                const sId_str = `s${sId++}`;
                suggestions.push({
                    id: sId_str,
                    type: 'bullet',
                    sectionId: originalEntry.sectionId,
                    itemIndex: originalEntry.itemIndex,
                    original: originalEntry.text,
                    suggested: bullet,
                    status: (savedStatuses[sId_str] as 'pending' | 'accepted' | 'rejected') || 'pending',
                    title: 'Impact Optimization',
                    sectionLabel: originalEntry.sectionLabel
                });
            }
        });

        // Missing keywords — only add ones not already in the skills list
        const existingSkills = new Set(resumeData.skills.map(s => s.toLowerCase()));
        aiData.missingKeywords.forEach((kw: string) => {
            if (existingSkills.has(kw.toLowerCase())) return;
            const sId_str = `s${sId++}`;
            suggestions.push({
                id: sId_str,
                type: 'skill',
                original: '',
                suggested: kw,
                status: (savedStatuses[sId_str] as 'pending' | 'accepted' | 'rejected') || 'pending',
                title: 'Add Missing ATS Keyword',
                sectionLabel: 'Skills & Technologies'
            });
        });

        // Recommended skills that aren't already in the list and aren't suggested as missingKeywords
        const missingKeywordSet = new Set(aiData.missingKeywords.map(k => k.toLowerCase()));
        aiData.recommendedSkills.forEach((skill: string) => {
            if (existingSkills.has(skill.toLowerCase()) || missingKeywordSet.has(skill.toLowerCase())) return;
            const sId_str = `s${sId++}`;
            suggestions.push({
                id: sId_str,
                type: 'skill',
                original: '',
                suggested: skill,
                status: (savedStatuses[sId_str] as 'pending' | 'accepted' | 'rejected') || 'pending',
                title: 'Recommended Skill',
                sectionLabel: 'Skills & Technologies'
            });
        });

        res.status(200).json({
            success: true,
            data: {
                resume: resumeData,
                suggestions,
                analysisData: {
                    atsScore: aiData.atsScore,
                    missingKeywords: aiData.missingKeywords,
                    resumeSuggestions: aiData.resumeSuggestions,
                    improvedBulletPoints: aiData.improvedBulletPoints,
                    recommendedSkills: aiData.recommendedSkills,
                    interviewQuestions: aiData.interviewQuestions,
                    coverLetter: aiData.coverLetter
                }
            }
        });
    } catch (error) {
        next(error);
    }
};