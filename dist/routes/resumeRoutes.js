"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const resumeController_1 = require("../controllers/resumeController");
const router = (0, express_1.Router)();
router.post('/analyze', uploadMiddleware_1.uploadMiddleware.single('resume'), resumeController_1.processResume);
exports.default = router;
