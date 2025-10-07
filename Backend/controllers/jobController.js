

import pool from "../config/dbConnection.js";
import { 
    CREATE_JOB,
    GET_ALL_JOBS,
    GET_JOB_BY_ID,
    GET_EMPLOYER_JOBS,
    UPDATE_JOB,
    DELETE_JOB,
    getJobsByCompanyQuery
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
// Get Jobs by specific Company (approved jobs only)
export const getJobsByCompany = async (req, res) => {
  try {
    const { employerId } = req.params;

    const [jobs] = await pool.query(getJobsByCompanyQuery, [employerId]);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No approved jobs found for this company." });
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    res.status(500).json({ error: "Server error while fetching company jobs." });
  }
};