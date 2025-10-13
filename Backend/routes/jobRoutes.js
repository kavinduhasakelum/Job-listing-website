
import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobsByEmployer,
  updateJob,
  deleteJob,
  approveOrRejectJob,
  getJobsByCompany,
  getApplicantsByJob,
  updateApplicationStatus,
  applyJob,
  getMyApplications,
  saveJob,
  getSavedJobs,
  removeSavedJob,
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
  (req, res, next) => {
    console.log("🎯 POST /job/create route hit");
    console.log("  - Has file:", !!req.file);
    console.log("  - Body keys:", Object.keys(req.body));
    next();
  },
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  createJob
);

// Specific routes FIRST
router.get("/", getAllJobs);
router.get("/my-jobs", verifyToken, isEmployer, getJobsByEmployer);
router.get("/my/applications", verifyToken, getMyApplications);
router.get("/saved", verifyToken, getSavedJobs);
router.get("/company/:employerId", getJobsByCompany);

// Admin approval
router.put("/approve/:jobId", verifyToken, isAdmin, approveOrRejectJob);

// Save/Unsave job routes - BEFORE /:id routes
router.post("/:jobId/save", verifyToken, saveJob);
router.delete("/:jobId/save", verifyToken, removeSavedJob);

// Applicant management - MUST be before generic /:id routes
router.get("/:jobId/applicants", (req, res, next) => {
  console.log("🎯 Applicants route matched! JobId:", req.params.jobId);
  next();
}, verifyToken, isEmployer, getApplicantsByJob);
router.put("/:jobId/applicants/:applicationId/status", verifyToken, isEmployer, updateApplicationStatus);

// Job application - BEFORE /:id route
router.post("/:jobId/apply", verifyToken, upload.single("resume"), applyJob);

// Job CRUD - with parametric routes
router.put(
  "/:id",
  verifyToken,
  isEmployer,
  upload.single("company_logo"),
  updateJob
);

router.delete("/:id", verifyToken, isEmployer, deleteJob);

// Must be LAST - generic GET by ID
router.get("/:id", getJobById);

// Log all registered routes
console.log("📋 Job Routes registered:");
router.stack.forEach((r) => {
  if (r.route) {
    const methods = Object.keys(r.route.methods).join(', ').toUpperCase();
    console.log(`   ${methods} /job${r.route.path}`);
  }
});

export default router;