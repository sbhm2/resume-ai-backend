"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const resumeController_1 = require("../controllers/resumeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect, check limit, parse file, process
router.post('/analyze', authMiddleware_1.authenticate, uploadMiddleware_1.uploadMiddleware.single('resume'), resumeController_1.processResume);
exports.default = router;
