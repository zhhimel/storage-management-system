import express from 'express';
import { upload } from '../../utils/upload';
import { uploadFile, favoriteItem, renameItem, duplicateItem, deleteItem, shareItem } from './item.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = express.Router();
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/:itemId/favorite', authMiddleware, favoriteItem);
router.patch('/:itemId/rename', authMiddleware, renameItem);
router.post('/:itemId/duplicate', authMiddleware, duplicateItem);
router.delete('/:itemId', authMiddleware, deleteItem);
router.post('/:itemId/share', authMiddleware, shareItem);

export const itemRoutes = router;
