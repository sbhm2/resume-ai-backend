"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
router.get('/test', async (req, res, next) => {
    try {
        const dbStatus = await prisma_1.prisma.$queryRaw `SELECT 1 as status`;
        res.status(200).json({
            success: true,
            system: 'running',
            database: {
                connected: true,
                query: dbStatus && Array.isArray(dbStatus) ? true : true,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            system: 'running',
            database: {
                connected: false,
                error: error.message || 'Unable to connect to the database',
            },
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
