import express from 'express';
import {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    changePassword,
    verifySession
} from '../controllers/authController.js';

import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js'; // Assume this middleware verifies token

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Email verification and token verification
router.get("/verify", verifyToken, verifySession);
router.get("/verify-email", verifyEmail);

// Email Verification Send
router.post("/send-verification", sendVerificationEmail);

// Forgot & reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Change Password
router.post("/change-password", verifyToken, changePassword);

export default router;
