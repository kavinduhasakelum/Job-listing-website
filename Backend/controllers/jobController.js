

import pool from "../config/dbConnection.js";
import cloudinary from "../utils/cloudinary.js";
import {
  insertJobQuery,
  getJobsQuery,
  getJobByIdQuery,
  updateJobQuery,
  deleteJobQuery
} from "../queries/jobQueries.js";
import nodemailer from 'nodemailer';

// Create Job
export const createJob = async (req, res) => {
  try {
    const employerId = req.user.id;

    // Check if employer profile exists
    const [profile] = await pool.query(
      "SELECT * FROM employer WHERE user_id = ?",
      [employerId]
    );

    if (profile.length === 0) {
      return res.status(400).json({ error: "Please complete your employer profile first." });
    }
    const {
      title,
      description,
      location,
      work_type,
      job_type,
      experience_level,
      industry,
      salary_min,
      salary_max,
    } = req.body;

    if (!title || !description || !location || !industry || !salary_min || !salary_max) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    let logoUrl = null;
    if (req.file) {
      const uploadFromBuffer = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "company/logos" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

      const result = await uploadFromBuffer(req.file.buffer);
      logoUrl = result.secure_url;
    }

    await pool.query(insertJobQuery, [
      employerId,
      title,
      description,
      location,
      work_type || "onsite",
      job_type || "full-time",
      experience_level || "entry",
      industry,
      salary_min,
      salary_max,
      logoUrl,
    ]);

    res.json({ message: "Job created successfully and waiting for admin approval." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(getJobsQuery);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const [job] = await pool.query(getJobByIdQuery, [id]);

    if (job.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];

    // Upload logo if exists
    if (req.file) {
      const uploadFromBuffer = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "company_logos" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

      const result = await uploadFromBuffer(req.file.buffer);
      fields.push("company_logo=?");
      values.push(result.secure_url); // store the Cloudinary URL
    }

    // Add other fields dynamically
    const bodyFields = ["title", "description", "location", "work_type", "job_type", "experience_level", "industry", "salary_min", "salary_max"];
    bodyFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fields.push(`${field}=?`);
        values.push(req.body[field]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(id, req.user.id); // job_id and employer_id for WHERE clause

    const query = `
      UPDATE jobs
      SET ${fields.join(", ")}, status='pending'
      WHERE job_id=? AND employer_id=?
    `;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({ message: "Job updated successfully and waiting for admin approval." });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Server error while updating job" });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query(deleteJobQuery, [id, employerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Jobs by Employer
export const getJobsByEmployer = async (req, res) => {
  try {
    const employerId = req.user.id;
    const [jobs] = await pool.query(getJobsByEmployerQuery, [employerId]);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject job (admin only)
export const approveJob = async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

if (status !== "approved" && status !== "rejected") {
  return res.status(400).json({ error: "Invalid status. Use approved or rejected." });
}

  try {
    const [jobResult] = await pool.query('SELECT * FROM jobs WHERE job_id = ?', [jobId]);
    if (jobResult.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await pool.query('UPDATE jobs SET status = ? WHERE job_id = ?', [status, jobId]);

    // Get employer email
    const [employer] = await pool.query(
      'SELECT email FROM users WHERE user_id = ?',
      [jobResult[0].employer_id]
    );

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employer[0].email,
      subject: `Your job "${jobResult[0].title}" has been ${status}`,
      text: `Hello, your job posting "${jobResult[0].title}" has been ${status} by the admin.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Job ${status} successfully and email sent to employer.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while approving job.' });
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