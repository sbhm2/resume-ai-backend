"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResume = void 0;
const crypto_1 = require("crypto");
const extractPdfText_1 = require("../utils/extractPdfText");
const extractDocxText_1 = require("../utils/extractDocxText");
const aiService_1 = require("../services/aiService");
const processResume = async (req, res, next) => {
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
        let resumeText = '';
        if (file.mimetype === 'application/pdf') {
            resumeText = await (0, extractPdfText_1.extractPdfText)(file.buffer);
        }
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword') {
            resumeText = await (0, extractDocxText_1.extractDocxText)(file.buffer);
        }
        else {
            res.status(400).json({ success: false, error: 'Unsupported file type' });
            return;
        }
        if (!resumeText || resumeText.length < 50) {
            res.status(400).json({ success: false, error: 'Could not extract sufficient text from the file' });
            return;
        }
        const aiAnalysis = await (0, aiService_1.analyzeResume)(resumeText, jobDescription);
        const response = {
            success: true,
            requestId: (0, crypto_1.randomUUID)(),
            generatedAt: new Date().toISOString(),
            data: aiAnalysis,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error); // Pass to global error handler
    }
};
exports.processResume = processResume;
