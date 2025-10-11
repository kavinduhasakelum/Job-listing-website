
import express from "express";
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

export default router;