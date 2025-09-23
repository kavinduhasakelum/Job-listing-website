import express from 'express';
import { 
    createEmployerProfile,
    getEmployerDetails,
    updateEmployerDetails,
    deleteProfilePicture
} from '../controllers/userController.js';
import upload from '../utils/multer.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Add employer details
router.post(
  "/employer/details",
  verifyToken,
  upload.single("profile_picture"), // <-- required if profile_picture file is sent
  createEmployerProfile
);

// Get employer details
router.get("/employer/details", verifyToken, getEmployerDetails);

// Update employer details
router.put("/employer/details", verifyToken, updateEmployerDetails);


// Upload profile picture
router.patch(
  "/employer/details",
  verifyToken,
  upload.single("profile_picture"),
  updateEmployerDetails
);

// Delete only profile picture
router.delete(
  "/employer/profile-picture",
  verifyToken,
  deleteProfilePicture
);

export default router;