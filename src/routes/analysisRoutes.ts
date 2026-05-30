import { Router } from 'express';
import { getHistory, getAnalysisById, deleteAnalysis } from '../controllers/analysisController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate); // Protect all history routes

router.get('/history', getHistory);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;