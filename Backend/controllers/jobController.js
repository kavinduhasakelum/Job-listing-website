import pool from "../config/dbConnection.js";
import upload from "../utils/multer.js";
import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/emailClient.js";
import {
  createJobRecord,
  findApprovedJobs,
  findApprovedJobById,
  findJobsByEmployerId,
  updateJobRecord,
  deleteJobRecord,
  findJobById,
  updateJobStatus,
  findApprovedJobsByCompany,
  incrementJobViews,
} from "../models/jobModel.js";
import { findEmployerProfileByUserId } from "../models/employerModel.js";
import { findUserEmailById } from "../models/userModel.js";
import nodemailer from "nodemailer";

// Upload image buffer to Cloudinary
const uploadFromBuffer = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

const STATUS_LABELS = {
  approved: "Approved",
  pending: "Pending review",
  rejected: "Rejected",
  closed: "Closed",
};

const toSafeNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normaliseJobForDashboard = (job = {}) => {
  if (!job) return null;

  const status = (job.status || "pending").toString().toLowerCase();
  const views = toSafeNumber(
    job.views ?? job.view_count ?? job.total_views ?? job.viewsCount
  );
  const applicants = toSafeNumber(
    job.applicants ?? job.applicants_count ?? job.total_applicants ?? job.applicationsCount
  );
  const conversionValue = views > 0 ? applicants / views : 0;
  const conversionRate = views > 0 ? `${Math.round(conversionValue * 100)}%` : "—";

  const tags = [job.work_type, job.job_type, job.experience_level, job.industry]
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);

  return {
    id: job.job_id ?? job.id ?? null,
    title: job.title ?? "Untitled role",
    location: job.location ?? "Location not specified",
    status,
    statusLabel: STATUS_LABELS[status] ?? STATUS_LABELS.pending,
    workType: job.work_type ?? null,
    jobType: job.job_type ?? null,
    experienceLevel: job.experience_level ?? null,
    industry: job.industry ?? null,
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    companyLogo: job.company_logo ?? null,
    createdAt: job.created_at ?? job.createdAt ?? null,
    updatedAt: job.updated_at ?? job.updatedAt ?? null,
    views,
    applicants,
    conversionRate,
    conversionValue,
    tags,
    raw: job,
  };
};

const computeJobStats = (jobs = []) => {
  if (!jobs.length) {
    return {
      totalJobs: 0,
      totalViews: 0,
      totalApplicants: 0,
      averageViews: 0,
      topViewedJobId: null,
      topConversionJobId: null,
    };
  }

  let totalViews = 0;
  let totalApplicants = 0;
  let topViewedJob = null;
  let topConversionJob = null;

  jobs.forEach((job) => {
    totalViews += job.views;
    totalApplicants += job.applicants;

    if (!topViewedJob || job.views > topViewedJob.views) {
      topViewedJob = job;
    }

    if (!topConversionJob || job.conversionValue > topConversionJob.conversionValue) {
      topConversionJob = job;
    }
  });

  return {
    totalJobs: jobs.length,
    totalViews,
    totalApplicants,
    averageViews: jobs.length ? Math.round(totalViews / jobs.length) : 0,
    topViewedJobId: topViewedJob?.id ?? null,
    topConversionJobId: topConversionJob?.id ?? null,
  };
};

// Create a new job
export const createJob = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ error: "Request body is required to create a job" });
    }

    const employerId = req.user.id;

    const profile = await findEmployerProfileByUserId(employerId);

    if (profile.length === 0) {
      return res
        .status(400)
        .json({ error: "Please complete your employer profile first." });
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

    if (!title || !description || !location || !industry) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    if (salary_min === undefined || salary_max === undefined) {
      return res
        .status(400)
        .json({ error: "Salary range (salary_min, salary_max) is required" });
    }

    let logoUrl = null;
    if (req.file) {
      const uploadResult = await uploadFromBuffer(
        req.file.buffer,
        "company/logos"
      );
      logoUrl = uploadResult.secure_url;
    }

    const insertResult = await createJobRecord([
      employerId,
      title.trim(),
      description,
      location,
      (work_type || "onsite").toLowerCase(),
      (job_type || "full-time").toLowerCase(),
      (experience_level || "entry").toLowerCase(),
      industry,
      salary_min,
      salary_max,
      logoUrl,
    ]);

    let jobPayload = null;

    if (insertResult?.insertId) {
      const createdJobs = await findJobById(insertResult.insertId);
      if (createdJobs.length > 0) {
        jobPayload = normaliseJobForDashboard(createdJobs[0]);
      }
    }

    res.status(201).json({
      message: "Job created successfully and waiting for admin approval.",
      job: jobPayload,
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Server error while creating job" });
  }
};

// Get all approved jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await findApprovedJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

// get job by id
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await findApprovedJobById(id);

    if (job.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    let jobRecord = job[0];

    try {
      await incrementJobViews(id);
      const previousViews = Number(
        jobRecord.views ??
          jobRecord.view_count ??
          jobRecord.total_views ??
          0
      );
      const updatedViews = Number.isFinite(previousViews)
        ? previousViews + 1
        : 1;
      jobRecord = {
        ...jobRecord,
        views: updatedViews,
      };
    } catch (viewError) {
      console.error("Failed to increment job views", viewError);
    }

    res.json(jobRecord);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching job" });
  }
};

// get jobs by employer
export const getJobsByEmployer = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobRows = await findJobsByEmployerId(employerId);
    const jobs = jobRows.map((job) => normaliseJobForDashboard(job)).filter(Boolean);
    const stats = computeJobStats(jobs);

    res.json({ jobs, stats });
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

// update job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    const fields = [];
    const values = [];

    if (req.file) {
      const uploadResult = await uploadFromBuffer(
        req.file.buffer,
        "company/logos"
      );
      fields.push("company_logo=?");
      values.push(uploadResult.secure_url);
    }

    const editableFields = [
      "title",
      "description",
      "location",
      "work_type",
      "job_type",
      "experience_level",
      "industry",
      "salary_min",
      "salary_max",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fields.push(`${field}=?`);
        values.push(req.body[field]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const result = await updateJobRecord(fields, values, id, employerId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    let updatedJob = null;
    const jobs = await findJobById(id);
    if (jobs.length > 0) {
      updatedJob = normaliseJobForDashboard(jobs[0]);
    }

    res.status(200).json({
      message: "Job updated successfully and waiting for admin approval.",
      job: updatedJob,
    });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Server error while updating job" });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { id } = req.params;

    const result = await deleteJobRecord(id, employerId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    const jobRows = await findJobsByEmployerId(employerId);
    const jobs = jobRows.map((job) => normaliseJobForDashboard(job)).filter(Boolean);
    const stats = computeJobStats(jobs);

    res.json({ message: "Job deleted successfully", jobs, stats });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting job" });
  }
};

// Email transporter (Gmail setup)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password
  },
});

// Approve or Reject Job (Admin only)
export const approveOrRejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, reason } = req.body; // status = 'approved' | 'rejected'

    // Validate input
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Use 'approved' or 'rejected'." });
    }

    // Fetch job and employer info
    const [jobResult] = await pool.query(
      `SELECT j.title, u.email 
       FROM jobs j 
       JOIN users u ON j.employer_id = u.user_id 
       WHERE j.job_id = ?`,
      [jobId]
    );

    if (jobResult.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const { title, email } = jobResult[0];

    // Update job status and optional rejection reason
    await pool.query(
      "UPDATE jobs SET status = ?, rejection_reason = ? WHERE job_id = ?",
      [status, status === "rejected" ? reason || "Not specified" : null, jobId]
    );

    // Send appropriate email
    const mailOptions =
      status === "approved"
        ? {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Job Approved ✅ - ${title}`,
            html: `
              <p>Hello,</p>
              <p>Your job posting <b>${title}</b> has been <b>approved</b> by the admin and is now visible to job seekers.</p>
            `,
          }
        : {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Job Rejected ❌ - ${title}`,
            html: `
              <p>Hello,</p>
              <p>Unfortunately, your job posting <b>${title}</b> has been <b>rejected</b> by the admin.</p>
              <p><b>Reason:</b> ${reason || "Not specified"}</p>
            `,
          };

    await transporter.sendMail(mailOptions);

    // Send response
    res.json({
      message:
        status === "approved"
          ? "Job approved successfully ✅ Email sent to employer."
          : "Job rejected ❌ Email sent with reason to employer.",
    });
  } catch (err) {
    console.error("Approve/Reject job error:", err);
    res.status(500).json({ error: "Server error while approving/rejecting job." });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await findJobById(jobId);

    if (jobs.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    await updateJobStatus(status, jobId);

    const employer = await findUserEmailById(jobs[0].employer_id);

    if (employer.length > 0) {
      await sendEmail({
        to: employer[0].email,
        subject: `Your job "${jobs[0].title}" has been ${status}`,
        text: `Hello, your job posting "${jobs[0].title}" has been ${status} by the admin.`,
      });
    }

    res.status(200).json({
      message: `Job ${status} successfully${
        employer.length > 0 ? " and email sent to employer" : ""
      }.`,
    });
  } catch (err) {
    console.error("Approve job error:", err);
    res.status(500).json({ error: "Server error while approving job" });
  }
};

// Save a job
export const saveJob = async (req, res) => {
  try {
    const jobseekerId = req.user.id;
    const { jobId } = req.params;

    const job = await findApprovedJobById(jobId);
    if (job.length === 0) {
      return res
        .status(404)
        .json({ error: "Job not found or not approved yet" });
    }

    const [existing] = await pool.query(
      "SELECT 1 FROM saved_jobs WHERE jobseeker_id = ? AND job_id = ?",
      [jobseekerId, jobId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Job already saved" });
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

export const getSavedJobs = async (req, res) => {
  try {
    const jobseekerId = req.user.id;

    const [rows] = await pool.query(
      `SELECT j.*
       FROM saved_jobs s
       JOIN jobs j ON s.job_id = j.job_id
       WHERE s.jobseeker_id = ?
       ORDER BY s.created_at DESC`,
      [jobseekerId]
    );

    const jobs = rows
      .map((job) => normaliseJobForDashboard(job))
      .filter(Boolean);

    res.json({ jobs });
  } catch (err) {
    console.error("Get saved jobs error:", err);
    res.status(500).json({ error: "Server error while fetching saved jobs" });
  }
};

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

// Get Jobs by specific Company (approved jobs only)
export const getJobsByCompany = async (req, res) => {
  try {
    const { employerId } = req.params;
    const jobs = await findApprovedJobsByCompany(employerId);

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No approved jobs found for this company." });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching company jobs:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching company jobs." });
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