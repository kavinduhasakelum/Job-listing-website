import express from "express";
import { 
  createJob, getAllJobs, getJobById, getEmployerJobs, updateJob, deleteJob
} from "../controllers/jobController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Employer protected
router.post("/", verifyToken, createJob);
router.get("/employer/my-jobs", verifyToken, getEmployerJobs);
router.put("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);

export default router;