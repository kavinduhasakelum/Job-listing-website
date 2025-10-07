import express from "express";
import { verifyToken, isAdmin, isEmployer} from "../middlewares/authMiddleware.js";
import multer from "multer";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  approveJob
} from "../controllers/jobController.js";

const router = express.Router();
const upload = multer(); // For logo upload

// Create Job
router.post("/", verifyToken, isEmployer, createJob);

// View Job
router.get("/my-jobs", verifyToken, isEmployer, getJobsByEmployer);

// Update Job
router.put("/:id", verifyToken, isEmployer, upload.single("company_logo"), updateJob);

// Delete Job
router.delete("/:id", verifyToken, isEmployer, deleteJob);

// Public routes
router.get("/", getAllJobs); // Show only approved jobs
router.get("/:id", getJobById); // View job details (only if approved)

// Admin approves a job
router.put('/approve/:jobId', verifyToken, isAdmin, approveJob);

export default router;