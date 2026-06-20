"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResume = void 0;
const extractPdfText_1 = require("../utils/extractPdfText");
const extractDocxText_1 = require("../utils/extractDocxText");
const aiService_1 = require("../services/aiService");
const prisma_1 = require("../config/prisma");
const processResume = async (req, res, next) => {
    try {
        const { jobDescription } = req.body;
        const file = req.file;
        const userId = req.user.id;
        if (!file || !jobDescription) {
            res.status(400).json({ success: false, error: 'Resume file and job description are required' });
            return;
        }
        let resumeText = '';
        if (file.mimetype === 'application/pdf')
            resumeText = await (0, extractPdfText_1.extractPdfText)(file.buffer);
        else
            resumeText = await (0, extractDocxText_1.extractDocxText)(file.buffer);
        // Call Gemini
        const aiAnalysis = await (0, aiService_1.analyzeResume)(resumeText, jobDescription);
        // Save Analysis to Database
        const savedAnalysis = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Save the analysis
            const analysis = await tx.resumeAnalysis.create({
                data: {
                    userId,
                    jobDescription,
                    resumeFileName: file.originalname,
                    atsScore: aiAnalysis.atsScore,
                    analysisJson: aiAnalysis
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
    }
    catch (error) {
        next(error);
    }
};
exports.processResume = processResume;
