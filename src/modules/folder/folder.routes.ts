import express from 'express';
import { createFolder, listFolders } from './folder.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
const router = express.Router();
router.post('/', authMiddleware, createFolder);
router.get('/', authMiddleware, listFolders);
export const folderRoutes = router;
