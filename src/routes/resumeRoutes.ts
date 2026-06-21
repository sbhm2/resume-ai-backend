import { Router } from 'express';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { processResume } from '../controllers/resumeController';
import { authenticate } from '../middleware/authMiddleware';
import { checkUsageLimit } from '../middleware/usageLimitMiddleware';

const router = Router();

// Protect, check limit, parse file, process
router.post('/analyze', authenticate, checkUsageLimit, uploadMiddleware.single('resume'), processResume);

export default router;