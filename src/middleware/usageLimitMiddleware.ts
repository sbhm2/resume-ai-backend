import { Request, Response, NextFunction } from 'express';
import {prisma} from '../config/prisma';

export const checkUsageLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Find or create today's usage record
        let tracking = await prisma.usageTracking.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (!tracking) {
            tracking = await prisma.usageTracking.create({
                data: { userId, date: today, month: currentMonth, year: currentYear, analysisCount: 0 }
            });
        }

        if (tracking.analysisCount >= 5) {
            res.status(429).json({ 
                success: false, 
                error: 'Daily limit exceeded. Free users are limited to 5 analyses per day.' 
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
};