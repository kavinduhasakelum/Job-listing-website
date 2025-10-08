import pool from "../config/dbConnection.js";
import {
  CREATE_JOB,
  GET_ALL_JOBS,
  GET_JOB_BY_ID,
  GET_EMPLOYER_JOBS,
  UPDATE_JOB,
  DELETE_JOB,
} from "../queries/jobQueries.js";

// Create job with salary range + logo
export const createJob = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ error: "Request body is required to create a job" });
    }

    const { title, description, location, salary_min, salary_max } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        error: "title, description, and location are required fields",
      });
    }

    const employer_id = req.user.id; // from token
    const company_logo = req.file ? `/uploads/${req.file.filename}` : null;

    const jobType= req.body.job_type || "Full-time"; // Default to Full-time if not provided

    const [result] = await pool.query(CREATE_JOB, [
      employer_id,
      title,
      description,
      location,
      salary_max,
      jobType,
      company_logo,
    ]);

    res
      .status(201)
      .json({ message: "Job created successfully", jobId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(JOB_QUERIES.GET_ALL_JOBS);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const [job] = await pool.query(JOB_QUERIES.GET_JOB_BY_ID, [req.params.id]);

    if (job.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Employer’s Jobs
export const getEmployerJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(JOB_QUERIES.GET_EMPLOYER_JOBS, [
      req.params.id,
    ]);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;
    const { title, description, location, salary, job_type } = req.body;

    const [result] = await pool.query(JOB_QUERIES.UPDATE_JOB, [
      title,
      description,
      location,
      salary,
      job_type,
      id,
      employerId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Not authorized or job not found" });
    }

    res.json({ message: "Job updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    const [result] = await pool.query(JOB_QUERIES.DELETE_JOB, [id, employerId]);

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Not authorized or job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
