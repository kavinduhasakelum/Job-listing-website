import express from "express";
import {
  approveJob,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  createJob,
  getAllJobs,
  getJobById,
  getJobsByEmployer,
  updateJob,
  deleteJob,
  getJobsByCompany,
} from "../controllers/jobController.js";

import {
  verifyToken,
  isAdmin,
  isEmployer,
} from "../middlewares/authMiddleware.js";

import upload from "../utils/multer.js";

const router = express.Router();

// ---------------- Employer Protected Routes ----------------

// Create a job
router.post(
  "/create",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  createJob
);

// Get jobs posted by the logged-in employer
router.get("/my-jobs", verifyToken, isEmployer, getJobsByEmployer);

// Update a job
router.put(
  "/:id",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  updateJob
);

// Delete a job
router.delete("/:id", verifyToken, isEmployer, deleteJob);

// ---------------- Admin Protected Routes ----------------

// Approve a job
router.put("/approve/:jobId", verifyToken, isAdmin, approveJob);

// ---------------- Public Routes ----------------

// Get all jobs
router.get("/", getAllJobs);

// Get all approved jobs by a specific company
router.get("/company/:employerId", getJobsByCompany);

// Get a specific job by ID
router.get("/:id", getJobById);

// ---------------- Job Save Functionality (Jobseeker) ----------------

// Save a job
router.post("/save-job/:jobId", verifyToken, saveJob);

// Get all saved jobs
router.get("/save-job", verifyToken, getSavedJobs);

// Remove a saved job
router.delete("/save-job/:jobId", verifyToken, removeSavedJob);

export default router;
