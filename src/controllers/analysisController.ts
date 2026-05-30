import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

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