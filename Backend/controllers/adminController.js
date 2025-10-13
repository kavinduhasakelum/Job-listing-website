import pool from "../config/dbConnection.js";
import { sendEmail } from "../utils/emailClient.js";
import {
  getAllUsers as getAllUsersModel,
  getActiveUsers as getActiveUsersModel,
  getInactiveUsers as getInactiveUsersModel,
  getUserByIdAll as getUserByIdAllModel,
  getActiveUserById as getActiveUserByIdModel,
  getInactiveUserById as getInactiveUserByIdModel,
  softDeleteUserById,
  deleteUserById,
  findUsersByRole,
  findUserEmailById,
} from "../models/userModel.js";
import {
  findAllJobs,
  findPendingJobs,
  findRejectedJobs,
  findJobsByStatus,
  getJobStatistics,
  findJobById,
  updateJobStatus,
  deleteJobRecord,
} from "../models/jobModel.js";

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

    // Fetch job details
    const jobs = await findJobById(jobId);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = jobs[0];

    // Update job status and optional rejection reason
    await updateJobStatus(status, jobId);
    
    if (status === "rejected" && reason) {
      await pool.query(
        "UPDATE jobs SET rejection_reason = ? WHERE job_id = ?",
        [reason, jobId]
      );
    }

    // Get employer email
    const employerEmails = await findUserEmailById(job.employer_id);
    
    if (employerEmails.length > 0) {
      const email = employerEmails[0].email;
      
      // Send appropriate email
      const mailOptions =
        status === "approved"
          ? {
              to: email,
              subject: `Job Approved ✅ - ${job.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #7c3aed;">Job Posting Approved!</h2>
                  <p>Hello,</p>
                  <p>Great news! Your job posting <strong>${job.title}</strong> has been <strong>approved</strong> by our admin team and is now live on WorkNest.</p>
                  <p>Job seekers can now view and apply to your position.</p>
                  <p style="margin-top: 20px;">Best regards,<br/>WorkNest Team</p>
                </div>
              `,
            }
          : {
              to: email,
              subject: `Job Posting Needs Revision ❌ - ${job.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #dc2626;">Job Posting Requires Revision</h2>
                  <p>Hello,</p>
                  <p>Unfortunately, your job posting <strong>${job.title}</strong> needs some revisions before it can be published.</p>
                  <p><strong>Reason:</strong> ${reason || "Not specified"}</p>
                  <p>Please review the feedback, make the necessary changes, and resubmit your job posting.</p>
                  <p style="margin-top: 20px;">Best regards,<br/>WorkNest Team</p>
                </div>
              `,
            };

      try {
        await sendEmail(mailOptions);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue even if email fails
      }
    }

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