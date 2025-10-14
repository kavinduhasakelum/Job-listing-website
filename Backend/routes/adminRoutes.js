import express from "express";
import {
  getAllUsers,
  getActiveUsers,
  getInactiveUsers,
  getUserByIdAll,
  getActiveUserById,
  getInactiveUserById,
  softDeleteUser,
  hardDeleteUser,
  getUsersByRole,
  getAllJobs,
  approveOrRejectJob,
  deleteJobByAdmin,
  getPendingJobs,
  getRejectedJobs
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
router.get('/users/active/:id', getActiveUserById);
router.get("/users/inactive", getInactiveUsers);
router.get('/users/inactive/:id', getInactiveUserById);
router.delete("/users/soft/:id", softDeleteUser);
router.delete("/users/hard/:id", hardDeleteUser);
router.get("/users/:role", getUsersByRole);
router.get('/users/:id', getUserByIdAll);

// --- JOB MANAGEMENT ---
router.get("/jobs", getAllJobs);
router.get("/jobs/pending", getPendingJobs);
router.get("/jobs/rejected", getRejectedJobs);
router.put("/jobs/approve/:jobId", approveOrRejectJob);
router.delete("/jobs/:jobId", deleteJobByAdmin);

export default router;