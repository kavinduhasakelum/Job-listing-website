import express from 'express';
import {
    register,
    login,
    getAllUsers,
    getActiveUsers,
    getInactiveUsers,
    getUserByIdAll,
    getActiveUserById,
    getInactiveUserById,
    softDeleteUser,
    hardDeleteUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    changePassword,
    getUsersByRole
} from '../controllers/authController.js';

import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js'; // Assume this middleware verifies token

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/users', verifyToken, getAllUsers);
router.get('/users/active', verifyToken, getActiveUsers);
router.get('/users/inactive', verifyToken, getInactiveUsers);

router.get('/user/:id', verifyToken, getUserByIdAll);
router.get('/user/active/:id', verifyToken, getActiveUserById);
router.get('/user/inactive/:id', verifyToken, getInactiveUserById);

router.delete('/user/soft/:id', verifyToken, softDeleteUser);
router.delete('/user/hard/:id', verifyToken, isAdmin, hardDeleteUser); // Admin only

// Email verification
router.get("/verify-email", verifyEmail);

// Email Verification Send
router.post("/send-verification", sendVerificationEmail);

// Forgot & reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Change Password
router.post("/change-password", verifyToken, changePassword);

// Get users by role (Admin only)
router.get("/users/:role", verifyToken, isAdmin, getUsersByRole);

export default router;
