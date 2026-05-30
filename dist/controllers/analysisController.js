"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnalysis = exports.getAnalysisById = exports.getHistory = void 0;
const prisma_1 = require("../config/prisma");
const getHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const analyses = await prisma_1.prisma.resumeAnalysis.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: { id: true, jobDescription: true, resumeFileName: true, atsScore: true, createdAt: true }
        });
        const total = await prisma_1.prisma.resumeAnalysis.count({ where: { userId: req.user.id } });
        res.status(200).json({
            success: true,
            data: analyses,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
const getAnalysisById = async (req, res, next) => {
    try {
        const analysis = await prisma_1.prisma.resumeAnalysis.findUnique({
            where: { id: req.params.id }
        });
        if (!analysis || analysis.userId !== req.user.id) {
            res.status(404).json({ success: false, error: 'Analysis not found or unauthorized' });
            return;
        }
        res.status(200).json({ success: true, data: analysis });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalysisById = getAnalysisById;
const deleteAnalysis = async (req, res, next) => {
    try {
        const analysis = await prisma_1.prisma.resumeAnalysis.findUnique({
            where: { id: req.params.id }
        });
        if (!analysis || analysis.userId !== req.user.id) {
            res.status(404).json({ success: false, error: 'Analysis not found or unauthorized' });
            return;
        }
        await prisma_1.prisma.resumeAnalysis.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Analysis deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAnalysis = deleteAnalysis;
