import pool from "../config/dbConnection.js";
import {
  insertJobQuery,
  getJobsQuery,
  getJobByIdQuery,
  updateJobQuery,
  deleteJobQuery,
  getJobsByEmployerQuery,
} from "../queries/jobQueries.js";

export const createJobRecord = async (values) => {
  await pool.query(insertJobQuery, values);
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

export const updateJobStatus = async (status, jobId) => {
  await pool.query("UPDATE jobs SET status = ? WHERE job_id = ?", [
    status,
    jobId,
  ]);
};

