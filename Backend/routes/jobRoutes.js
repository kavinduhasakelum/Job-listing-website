
import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobsByEmployer,
  updateJob,
  deleteJob,
  getJobsByCompany,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  getEmployerJobs,
  applyJob,
  getMyApplications,
  getApplicantsByJob,
  updateApplicationStatus
} from "../controllers/jobController.js";
import {
  verifyToken,
  isAdmin,
  isEmployer
} from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Create Job
router.post(
  "/create",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  createJob
);

// Get Jobs by Employer
router.get("/my-jobs", verifyToken, isEmployer, getJobsByEmployer);

// Update Job
router.put(
  "/:id",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  updateJob
);

// Delete Job
router.delete("/:id", verifyToken, isEmployer, deleteJob);

// Save a job
router.post("/save-job/:jobId", verifyToken, saveJob);

// Get all saved jobs of jobseeker
router.get("/save-job", verifyToken, getSavedJobs);

// Remove a saved job
router.delete("/save-job/:jobId", verifyToken, removeSavedJob);

// View all approved jobs by a company (Public)
router.get("/company/:employerId", getJobsByCompany);

// Apply for a job
router.post("/apply", verifyToken, upload.single("resume"), applyJob);

// Get all jobs posted by the logged-in jobseeker
router.get("/my-applications", verifyToken, getMyApplications);

// Get all jobs posted by the logged-in employer
router.get("/applicants/:job_id", verifyToken, getApplicantsByJob);

// Update application status (Approve/Reject) - Employer only
router.patch("/application/:application_id/status", verifyToken, updateApplicationStatus);

router.get("/", getAllJobs);
router.get("/:id", getJobById);

export default router;