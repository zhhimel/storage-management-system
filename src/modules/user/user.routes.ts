import express from 'express';
import { editProfile, changePassword, deleteAccount } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from '../../utils/upload'; // for profile image
const router = express.Router();
router.patch('/profile', authMiddleware, upload.single('image'), editProfile);
router.post('/change-password', authMiddleware, changePassword);
router.delete('/delete', authMiddleware, deleteAccount);
export const userRoutes = router;
