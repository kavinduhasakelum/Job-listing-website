import pool from "../config/dbConnection.js";
import { sendEmail } from "../utils/emailClient.js";
import {
  GET_ALL_USERS,
  GET_ACTIVE_USERS,
  GET_INACTIVE_USERS,
  GET_USER_BY_ID_ALL,
  GET_ACTIVE_USER_BY_ID,
  GET_INACTIVE_USER_BY_ID,
  SOFT_DELETE_USER_BY_ID,
  DELETE_USER_BY_ID,
} from "../queries/authQueries.js";
import {
  getJobsQuery,
  getJobByIdQuery,
} from "../queries/jobQueries.js";
import {
  getEmployerDetailsQuery,
  getJobSeekerDetailsQuery,
} from "../queries/userQueries.js";
import { findJobById, updateJobStatus } from "../models/jobModel.js";

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

// --- JOBS MANAGEMENT ---

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

// Delete job
export const deleteJobByAdmin = async (req, res) => {
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