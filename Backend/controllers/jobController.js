import pool from "../config/dbConnection.js";
import { 
    CREATE_JOB,
    GET_ALL_JOBS,
    GET_JOB_BY_ID,
    GET_EMPLOYER_JOBS,
    UPDATE_JOB,
    DELETE_JOB
 } from "../queries/jobQueries.js";

// Create job with salary range + logo
export const createJob = async (req, res) => {
  try {
    const { title, description, location, salary_min, salary_max } = req.body;
    const employer_id = req.user.id; // from token
    const company_logo = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(CREATE_JOB, [
      title, description, location, salary_min, salary_max, company_logo, employer_id,
    ]);

    res.status(201).json({ message: "Job created successfully", jobId: result.insertId });
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
    const [jobs] = await pool.query(JOB_QUERIES.GET_EMPLOYER_JOBS, [req.params.id]);
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

// Save a job
export const saveJob = async (req, res) => {
  try {
    const jobseekerId = req.user.id;
    const { jobId } = req.params;

    // check if job exists and is approved
    const [job] = await pool.query(
      "SELECT * FROM jobs WHERE job_id = ? AND status = 'approved'",
      [jobId]
    );
    if (job.length === 0) {
      return res.status(404).json({ error: "Job not found or not approved yet" });
    }

    // check if already saved
    const [existing] = await pool.query(
      "SELECT * FROM saved_jobs WHERE jobseeker_id = ? AND job_id = ?",
      [jobseekerId, jobId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Job already saved" });
    }

    await pool.query(
      "INSERT INTO saved_jobs (jobseeker_id, job_id) VALUES (?, ?)",
      [jobseekerId, jobId]
    );

    res.status(201).json({ message: "Job saved successfully" });
  } catch (err) {
    console.error("Save job error:", err);
    res.status(500).json({ error: "Server error while saving job" });
  }
};

// Get all saved jobs for current jobseeker
export const getSavedJobs = async (req, res) => {
  try {
    const jobseekerId = req.user.id;
    console.log("Jobseeker ID:", jobseekerId);

    const [saved] = await pool.query("SELECT * FROM saved_jobs WHERE jobseeker_id = ?", [jobseekerId]);
    console.log("Saved jobs raw:", saved);

    const [joined] = await pool.query(
      `SELECT j.* 
       FROM saved_jobs s 
       JOIN jobs j ON s.job_id = j.job_id 
       WHERE s.jobseeker_id = ?`,
      [jobseekerId]
    );

    console.log("Joined results:", joined);

    if (joined.length === 0) {
      return res.status(404).json({ message: "No saved jobs found" });
    }

    res.json(joined);
  } catch (err) {
    console.error("Get saved jobs error:", err);
    res.status(500).json({ error: "Server error while fetching saved jobs" });
  }
};

// Remove a saved job
export const removeSavedJob = async (req, res) => {
  try {
    const jobseekerId = req.user.id;
    const { jobId } = req.params;

    const [result] = await pool.query(
      "DELETE FROM saved_jobs WHERE jobseeker_id = ? AND job_id = ?",
      [jobseekerId, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    res.json({ message: "Saved job removed successfully" });
  } catch (err) {
    console.error("Remove saved job error:", err);
    res.status(500).json({ error: "Server error while removing saved job" });
  }
};