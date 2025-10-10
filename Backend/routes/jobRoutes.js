
import express from "express";
import { 
 approveJob, saveJob, getSavedJobs, removeSavedJob, createJob, getAllJobs, getJobById, getEmployerJobs, updateJob, deleteJob
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobsByEmployer,
  updateJob,
  deleteJob,
  approveJob,
  getJobsByCompany,
} from "../controllers/jobController.js";
import {
  verifyToken,
  isAdmin,
  isEmployer,
} from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  createJob
);

router.get("/my-jobs", verifyToken, isEmployer, getJobsByEmployer);

router.put(
  "/:id",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  updateJob
);

router.delete("/:id", verifyToken, isEmployer, deleteJob);

router.put("/approve/:jobId", verifyToken, isAdmin, approveJob);

router.get("/", getAllJobs);
// View all approved jobs by a company (Public)
router.get("/company/:employerId", getJobsByCompany);
router.get("/:id", getJobById);
<<<<<<< HEAD
=======

// Employer protected
router.post("/", verifyToken, createJob);
router.get("/employer/my-jobs", verifyToken, getEmployerJobs);
router.put("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);

// Save a job
router.post("/save-job/:jobId", verifyToken, saveJob);

// Get all saved jobs of jobseeker
router.get("/save-job", verifyToken, getSavedJobs);

// Remove a saved job
router.delete("/save-job/:jobId", verifyToken, removeSavedJob);

// View all approved jobs by a company (Public)
router.get("/company/:employerId", getJobsByCompany);
>>>>>>> 85eb812019f8a5af4e309d87cc62c21e277185c0
export default router;