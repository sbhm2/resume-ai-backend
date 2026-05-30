import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { extractPdfText } from '../utils/extractPdfText';
import { extractDocxText } from '../utils/extractDocxText';
import { analyzeResume } from '../services/aiService';
import { AnalyzeResumeSuccessResponse } from '../types';

export const processResume = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { jobDescription } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ success: false, error: 'Resume file is required' });
            return;
        }

        if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
            res.status(400).json({ success: false, error: 'Job description is required' });
            return;
        }

        let resumeText: string = '';

        if (file.mimetype === 'application/pdf') {
            resumeText = await extractPdfText(file.buffer);
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.mimetype === 'application/msword'
        ) {
            resumeText = await extractDocxText(file.buffer);
        } else {
            res.status(400).json({ success: false, error: 'Unsupported file type' });
            return;
        }

        if (!resumeText || resumeText.length < 50) {
            res.status(400).json({ success: false, error: 'Could not extract sufficient text from the file' });
            return;
        }

        const aiAnalysis = await analyzeResume(resumeText, jobDescription);

        const response: AnalyzeResumeSuccessResponse = {
            success: true,
            requestId: randomUUID(),
            generatedAt: new Date().toISOString(),
            data: aiAnalysis,
        };

        res.status(200).json(response);

    } catch (error) {
        next(error); // Pass to global error handler
    }
};