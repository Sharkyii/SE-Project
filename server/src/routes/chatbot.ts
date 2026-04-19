import { Router } from 'express';
import { chatbotController } from '../controllers/chatbotController';

const router = Router();

// Public routes (no auth required)
router.post('/message', chatbotController.sendMessage);
router.get('/courses', chatbotController.getCourseInfo);
router.get('/stats', chatbotController.getPublicStats);

export default router;
