import { Router } from 'express';
import { signup, signin, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;