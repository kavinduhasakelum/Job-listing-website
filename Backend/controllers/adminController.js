import pool from "../config/dbConnection.js";
import {
  getAllUsers as getAllUsersModel,
  getActiveUsers as getActiveUsersModel,
  getInactiveUsers as getInactiveUsersModel,
  getActiveUserById as getActiveUserByIdModel,
  getUserByIdAll as getUserByIdAllModel,
  getInactiveUserById as getInactiveUserByIdModel,
  deleteUserById,
  softDeleteUserById,
  findUsersByRole
} from "../models/userModel.js";

import { findJobById } from "../models/jobModel.js";
import { sendEmail } from "../utils/emailClient.js";

/**  ===============================
 *      --- USER MANAGEMENT ---
 *   =============================== */

// View all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersModel();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View active users
export const getActiveUsers = async (req, res) => {
  try {
    const users = await getActiveUsersModel();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View inactive users
export const getInactiveUsers = async (req, res) => {
  try {
    const users = await getInactiveUsersModel();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View any user by ID
export const getUserByIdAll = async (req, res) => {
  const { id } = req.params;

  try {
    const users = await getUserByIdAllModel(id);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View active user by ID
export const getActiveUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const users = await getActiveUserByIdModel(id);
    if (users.length === 0) return res.status(404).json({ error: "Active user not found" });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View inactive user by ID
export const getInactiveUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const users = await getInactiveUserByIdModel(id);
    if (users.length === 0) return res.status(404).json({ error: "Inactive user not found" });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete user
export const softDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getActiveUserByIdModel(id);
    if (user.length === 0) return res.status(404).json({ error: "User not found" });

    await softDeleteUserById(id);
    res.json({ message: "User soft deleted (marked as deleted)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hard delete user (admin only)
export const hardDeleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Only admin can perform hard delete" });
  }

  try {
    const user = await getUserByIdAllModel(id);
    if (user.length === 0) return res.status(404).json({ error: "User not found" });

    await deleteUserById(id);
    res.json({ message: "User permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const normalizedRole = role.toLowerCase();
    const allowedRoles = ["admin", "employer", "jobseeker"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    const users = await findUsersByRole(normalizedRole);
    if (users.length === 0) return res.status(404).json({ error: `No users found with role: ${role}` });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**  ===============================
 *      --- JOBS MANAGEMENT ---
 *   =============================== */

// Get all jobs (any status)
export const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Error fetching jobs" });
  }
};

// Get pending jobs
export const getPendingJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching pending jobs:", err);
    res.status(500).json({ error: "Error fetching pending jobs" });
  }
};

// Get rejected jobs
export const getRejectedJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE status = 'rejected' ORDER BY created_at DESC"
    );
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching rejected jobs:", err);
    res.status(500).json({ error: "Error fetching rejected jobs" });
  }
};

// Get all jobs (admin view)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await findAllJobs();
    res.json(jobs);
  } catch (err) {
    console.error("Get all jobs error:", err);
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

// Get pending jobs
export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await findPendingJobs();
    res.json(jobs);
  } catch (err) {
    console.error("Get pending jobs error:", err);
    res.status(500).json({ error: "Server error while fetching pending jobs" });
  }
};

// Get rejected jobs
export const getRejectedJobs = async (req, res) => {
  try {
    const jobs = await findRejectedJobs();
    res.json(jobs);
  } catch (err) {
    console.error("Get rejected jobs error:", err);
    res.status(500).json({ error: "Server error while fetching rejected jobs" });
  }
};

// Get jobs by status
export const getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'approved', 'rejected', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const jobs = await findJobsByStatus(status);
    res.json(jobs);
  } catch (err) {
    console.error("Get jobs by status error:", err);
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const jobStats = await getJobStatistics();
    
    // Get user statistics
    const [userStats] = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'employer' THEN 1 ELSE 0 END) as total_employers,
        SUM(CASE WHEN role = 'jobseeker' THEN 1 ELSE 0 END) as total_jobseekers,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN is_deleted = 0 THEN 1 ELSE 0 END) as active_users
      FROM users
    `);

    res.json({
      jobs: jobStats,
      users: userStats[0],
    });
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    res.status(500).json({ error: "Server error while fetching statistics" });
  }
};

// Approve or reject job
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

    const job = jobs[0];

    // Update job status and optional rejection reason
    await pool.query(
      "UPDATE jobs SET status = ?, rejection_reason = ? WHERE job_id = ?",
      [status, status === "rejected" ? reason || "Not specified" : null, jobId]
    );

    // Send appropriate email using the imported sendEmail function
    const mailOptions =
      status === "approved"
        ? {
            // No need for 'from' here as sendEmail handles SMTP_FROM/SMTP_USER
            to: email,
            subject: `Job Approved ✅ - ${title}`,
            html: `
              <p>Hello,</p>
              <p>Your job posting <b>${title}</b> has been <b>approved</b> by the admin and is now visible to job seekers.</p>
            `,
          }
        : {
            // No need for 'from' here as sendEmail handles SMTP_FROM/SMTP_USER
            to: email,
            subject: `Job Rejected ❌ - ${title}`,
            html: `
              <p>Hello,</p>
              <p>Unfortunately, your job posting <b>${title}</b> has been <b>rejected</b> by the admin.</p>
              <p><b>Reason:</b> ${reason || "Not specified"}</p>
            `,
          };

    // Use sendEmail function
    await sendEmail(mailOptions);

    // Send response
    res.json({
      message:
        status === "approved"
          ? "Job approved successfully ✅"
          : "Job rejected ❌",
      job: jobs[0],
    });
  } catch (err) {
    console.error("Approve/Reject job error:", err);
    res.status(500).json({ error: "Server error while approving/rejecting job." });
  }
};

// Delete job
export const deleteJobByAdmin = async (req, res) => {
  const { jobId } = req.params; // Destructure and rename id to jobId for clarity
  // Ensure only admins can access this route
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Only administrators can delete jobs." });
  }

  try {
    // 1. Check if the job exists using the existing findJobById from jobModel.js
    const existingJob = await findJobById(jobId);
    if (existingJob.length === 0) {
      return res.status(404).json({ error: "Job not found." });
    }

    // 2. Perform the deletion directly using pool.query for admin
    const [result] = await pool.query("DELETE FROM jobs WHERE job_id = ?", [jobId]);

    if (result.affectedRows === 0) {
      // This case might mean it was found but for some reason not deleted (e.g., race condition)
      return res.status(500).json({ error: "Failed to delete job. It might no longer exist." });
    }

    res.json({ message: "Job permanently deleted by admin successfully." });
  } catch (err) {
    console.error("Admin delete job error:", err);
    res.status(500).json({ error: "Server error while deleting job." });
  }
};