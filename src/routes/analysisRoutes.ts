import { Router } from 'express';
import { getHistory, getAnalysisById, deleteAnalysis, getEditorData, getDashboard } from '../controllers/analysisController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate); // Protect all history routes

router.get('/dashboard', getDashboard);
router.get('/history', getHistory);
router.get('/editor-data/:id', getEditorData);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;