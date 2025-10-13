import express from "express";
import {
  getAllUsers,
  getActiveUsers,
  getInactiveUsers,
  softDeleteUser,
  hardDeleteUser,
} from "../controllers/authController.js";

import {
  getAllJobs,
  getPendingJobs,
  getRejectedJobs,
  getJobsByStatus,
  getDashboardStats,
  approveOrRejectJob,
  deleteJobByAdmin,
} from "../controllers/adminController.js";

import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes here require admin access
router.use(verifyToken, isAdmin);

// --- DASHBOARD STATISTICS ---
router.get("/statistics", getDashboardStats);

// --- USER MANAGEMENT ---
router.get("/users", getAllUsers);
router.get("/users/active", getActiveUsers);
router.get("/users/inactive", getInactiveUsers);
router.delete("/users/soft/:id", softDeleteUser);
router.delete("/users/hard/:id", hardDeleteUser);

// --- JOB MANAGEMENT ---
router.get("/jobs", getAllJobs);
router.get("/jobs/pending", getPendingJobs);
router.get("/jobs/rejected", getRejectedJobs);
router.get("/jobs/status/:status", getJobsByStatus);
router.put("/jobs/approve/:jobId", approveOrRejectJob);
router.delete("/jobs/:jobId", deleteJobByAdmin);

export default router;