import { Router } from 'express';
import { getHistory, getAnalysisById, deleteAnalysis, getEditorData, saveDraft, getDashboard } from '../controllers/analysisController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate); // Protect all history routes

router.get('/dashboard', getDashboard);
router.get('/history', getHistory);
router.get('/editor-data/:id', getEditorData);
router.put('/editor-data/:id/draft', saveDraft);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;