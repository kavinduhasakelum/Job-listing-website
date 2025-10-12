import pool from "../config/dbConnection.js";
import { 
    CREATE_JOB,
    GET_ALL_JOBS,
    GET_JOB_BY_ID,
    GET_EMPLOYER_JOBS,
    UPDATE_JOB,
    DELETE_JOB
 } from "../queries/jobQueries.js";
 import nodemailer from "nodemailer";
import upload from "../utils/multer.js";

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
// Apply for a job (Jobseeker)
export const applyJob = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { job_id, cover_letter } = req.body;

    // Check if jobseeker profile exists
    const [seekerRows] = await pool.query(
      "SELECT seeker_id FROM job_seeker WHERE user_id = ?",
      [userId]
    );
    if (seekerRows.length === 0) {
      return res.status(403).json({
        error: "Please create your job seeker profile first.",
        action: "/jobseeker/profile/create"
      });
    }

    const seekerId = seekerRows[0].seeker_id;

    // Check if job exists and is approved
    const [job] = await pool.query(
      "SELECT * FROM jobs WHERE job_id = ? AND status = 'approved'",
      [job_id]
    );
    if (job.length === 0) {
      return res.status(404).json({ error: "Job not found or not approved" });
    }

    // Prevent duplicate applications
    const [existing] = await pool.query(
      "SELECT * FROM job_applications WHERE job_id = ? AND seeker_id = ?",
      [job_id, seekerId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // Handle uploaded resume (PDF)
    let uploadedResume = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "resumes", resource_type: "raw" }
      );
      uploadedResume = result.secure_url;
    }

    const resumePath = uploadedResume || req.body.resume_url || null;

    // Insert application into DB
    await pool.query(
      "INSERT INTO job_applications (job_id, seeker_id, cover_letter, resume_url) VALUES (?, ?, ?, ?)",
      [job_id, seekerId, cover_letter, resumePath]
    );

    // Generate download-ready URL for PDF
    const getDownloadUrl = (url, filename = "resume.pdf") => {
      if (!url) return null;
      const parts = url.split("/upload/");
      if (parts.length !== 2) return url;
      return `${parts[0]}/upload/fl_attachment,${filename}/${parts[1]}`;
    };

    const downloadUrl = getDownloadUrl(resumePath);

    // Respond to client
    res.status(201).json({
      message: "Job application submitted successfully",
      resume: resumePath,
      downloadUrl,
    });

  } catch (err) {
    console.error("applyJob Error:", err);
    res.status(500).json({
      error: "Server error while applying for job",
      details: err.message
    });
  }
};

// Get all applications of current jobseeker
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seeker_id
    const [seekerRows] = await pool.query(
      "SELECT seeker_id FROM job_seeker WHERE user_id = ?",
      [userId]
    );
    if (seekerRows.length === 0)
      return res.status(404).json({ error: "Jobseeker profile not found" });

    const jobseekerId = seekerRows[0].seeker_id;

    // Fetch applications
    const [applications] = await pool.query(
      `SELECT 
          a.application_id,
          a.status,
          a.applied_at,
          j.title,
          j.location,
          j.company_logo
       FROM job_applications a
       JOIN jobs j ON a.job_id = j.job_id
       WHERE a.seeker_id = ?
       ORDER BY a.applied_at DESC`,
      [jobseekerId]
    );

    res.json(applications);
  } catch (err) {
    console.error("getMyApplications Error:", err);
    res.status(500).json({ error: "Server error while fetching applications" });
  }
};

// Get all applicants for a specific job (Employer only)
export const getApplicantsByJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { job_id } = req.params;

    // Verify job ownership
    const [job] = await pool.query(
      "SELECT * FROM jobs WHERE job_id = ? AND employer_id = ?",
      [job_id, employerId]
    );
    if (job.length === 0) {
      return res.status(403).json({ error: "Not authorized for this job" });
    }

    // Fetch applicants
    const [applicants] = await pool.query(
      `SELECT a.application_id, a.status, a.applied_at,
              js.full_name AS jobseeker_name,
              u.email AS jobseeker_email,
              a.cover_letter, a.resume_url
         FROM job_applications a
         JOIN job_seeker js ON a.seeker_id = js.seeker_id
         JOIN users u ON js.user_id = u.user_id
        WHERE a.job_id = ?`,
      [job_id]
    );

    // Generate download-ready URLs
    const getDownloadUrl = (url, filename = "resume.pdf") => {
      if (!url) return null;
      const parts = url.split("/upload/");
      if (parts.length !== 2) return url;
      return `${parts[0]}/upload/fl_attachment,${filename}/${parts[1]}`;
    };

    const applicantsWithDownload = applicants.map(app => ({
      ...app,
      downloadUrl: getDownloadUrl(app.resume_url),
    }));

    res.json(applicantsWithDownload);

  } catch (err) {
    console.error("getApplicantsByJob Error:", err);
    res.status(500).json({ error: "Server error while fetching applicants" });
  }
};

// Update application status + send email (Employer only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { application_id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    // Fetch application + job + jobseeker info
    const [rows] = await pool.query(
      `SELECT 
          a.application_id,
          a.job_id,
          j.title AS job_title,
          j.employer_id,
          u.email,
          u.userName AS jobseeker_name
       FROM job_applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN job_seeker js ON a.seeker_id = js.seeker_id
       JOIN users u ON js.user_id = u.user_id
       WHERE a.application_id = ?`,
      [application_id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Application not found" });

    const app = rows[0];

    // Verify employer owns the job
    if (app.employer_id !== employerId)
      return res.status(403).json({ error: "Not authorized to modify this application" });

    // Update status
    await pool.query(
      "UPDATE job_applications SET status = ? WHERE application_id = ?",
      [status, application_id]
    );

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subject =
      status === "Approved"
        ? "🎉 Your job application was approved!"
        : "❌ Your job application was rejected";

    const text =
      status === "Approved"
        ? `Hello ${app.jobseeker_name},

Congratulations! Your application for the job "${app.job_title}" has been approved by the employer.`
        : `Hello ${app.jobseeker_name},

We regret to inform you that your application for the job "${app.job_title}" has been rejected.`;

    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: app.email,
      subject,
      text,
    });

    res.json({ message: `Application ${status.toLowerCase()} successfully and email sent.` });
  } catch (err) {
    console.error("updateApplicationStatus Error:", err);
    res.status(500).json({ error: "Server error while updating status" });
  }
};