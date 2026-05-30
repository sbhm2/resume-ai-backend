"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysisController_1 = require("../controllers/analysisController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate); // Protect all history routes
router.get('/history', analysisController_1.getHistory);
router.get('/:id', analysisController_1.getAnalysisById);
router.delete('/:id', analysisController_1.deleteAnalysis);
exports.default = router;
