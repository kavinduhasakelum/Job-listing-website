import pool from "../config/dbConnection.js";
import {
  insertJobQuery,
  getJobsQuery,
  getJobByIdQuery,
  updateJobQuery,
  deleteJobQuery,
  getJobsByEmployerQuery,
  getApprovedJobsByCompanyQuery,
  incrementJobViewsQuery,
} from "../queries/jobQueries.js";

export const createJobRecord = async (values) => {
  const [result] = await pool.query(insertJobQuery, values);
  return result;
};

export const findApprovedJobs = async () => {
  const [rows] = await pool.query(getJobsQuery);
  return rows;
};

export const findApprovedJobById = async (jobId) => {
  const [rows] = await pool.query(getJobByIdQuery, [jobId]);
  return rows;
};

export const findJobsByEmployerId = async (employerId) => {
  const [rows] = await pool.query(getJobsByEmployerQuery, [employerId]);
  return rows;
};

export const updateJobRecord = async (fields, values, jobId, employerId) => {
  const query = updateJobQuery(fields);
  const [result] = await pool.query(query, [...values, jobId, employerId]);
  return result;
};

export const deleteJobRecord = async (jobId, employerId) => {
  const [result] = await pool.query(deleteJobQuery, [jobId, employerId]);
  return result;
};

export const findJobById = async (jobId) => {
  const [rows] = await pool.query("SELECT * FROM jobs WHERE job_id = ?", [
    jobId,
  ]);
  return rows;
};

export const findApprovedJobsByCompany = async (employerId) => {
  const [rows] = await pool.query(getApprovedJobsByCompanyQuery, [employerId]);
  return rows;
};

export const updateJobStatus = async (status, jobId) => {
  await pool.query("UPDATE jobs SET status = ? WHERE job_id = ?", [
    status,
    jobId,
  ]);
};

export const incrementJobViews = async (jobId) => {
  const [result] = await pool.query(incrementJobViewsQuery, [jobId]);
  return result;
};

export const findAllJobs = async () => {
  const [rows] = await pool.query(`
    SELECT j.*, u.userName as employer_name, u.email as employer_email
    FROM jobs j
    LEFT JOIN users u ON j.employer_id = u.user_id
    ORDER BY j.created_at DESC
  `);
  return rows;
};

export const findPendingJobs = async () => {
  const [rows] = await pool.query(`
    SELECT j.*, u.userName as employer_name, u.email as employer_email
    FROM jobs j
    LEFT JOIN users u ON j.employer_id = u.user_id
    WHERE j.status = 'pending'
    ORDER BY j.created_at DESC
  `);
  return rows;
};

export const findRejectedJobs = async () => {
  const [rows] = await pool.query(`
    SELECT j.*, u.userName as employer_name, u.email as employer_email
    FROM jobs j
    LEFT JOIN users u ON j.employer_id = u.user_id
    WHERE j.status = 'rejected'
    ORDER BY j.created_at DESC
  `);
  return rows;
};

export const findJobsByStatus = async (status) => {
  const [rows] = await pool.query(`
    SELECT j.*, u.userName as employer_name, u.email as employer_email
    FROM jobs j
    LEFT JOIN users u ON j.employer_id = u.user_id
    WHERE j.status = ?
    ORDER BY j.created_at DESC
  `, [status]);
  return rows;
};

export const getJobStatistics = async () => {
  const [stats] = await pool.query(`
    SELECT
      COUNT(*) as total_jobs,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_jobs,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_jobs,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_jobs,
      COALESCE(SUM(views), 0) as total_views,
      COALESCE(SUM(applicants), 0) as total_applicants
    FROM jobs
  `);
  return stats[0];
};

