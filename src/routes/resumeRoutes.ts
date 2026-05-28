import { Router } from 'express';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { processResume } from '../controllers/resumeController';

const router: Router = Router();

router.post('/analyze', uploadMiddleware.single('resume'), processResume);

export default router;