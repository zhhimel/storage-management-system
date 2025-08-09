import express from 'express';
import { getDashboard, searchItems } from './storage.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = express.Router();
router.get('/dashboard',  getDashboard);
router.get('/search', authMiddleware, searchItems);

export const storageRoutes = router;
