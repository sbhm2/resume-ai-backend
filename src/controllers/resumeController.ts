import { Request, Response, NextFunction } from 'express';
import { extractPdfText } from '../utils/extractPdfText';
import { extractDocxText } from '../utils/extractDocxText';
import { analyzeResume } from '../services/aiService';
import {prisma} from '../config/prisma';
import type { Prisma } from '@prisma/client';

export const processResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { jobDescription } = req.body;
        const file = req.file;
        const userId = req.user!.id;

        if (!file || !jobDescription) {
            res.status(400).json({ success: false, error: 'Resume file and job description are required' });
            return;
        }

        let resumeText = '';
        if (file.mimetype === 'application/pdf') resumeText = await extractPdfText(file.buffer);
        else resumeText = await extractDocxText(file.buffer);

        // Call Gemini
        const aiAnalysis = await analyzeResume(resumeText, jobDescription);

        // Save Analysis to Database
        const savedAnalysis = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Save the analysis
            const analysis = await tx.resumeAnalysis.create({
                data: {
                    userId,
                    jobDescription,
                    resumeFileName: file.originalname,
                    atsScore: aiAnalysis.atsScore,
                    analysisJson: aiAnalysis as any
                }
            });

            // 2. Increment usage tracking
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            await tx.usageTracking.update({
                where: { userId_date: { userId, date: today } },
                data: { analysisCount: { increment: 1 } }
            });

            return analysis;
        });

        res.status(200).json({
            success: true,
            data: savedAnalysis.analysisJson,
            analysisId: savedAnalysis.id
        });

    } catch (error) {
        next(error);
    }
};