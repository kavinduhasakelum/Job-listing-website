import pool from "../config/dbConnection.js";
import {
  insertEmployerDetailsQuery,
  getEmployerDetailsQuery,
  updateEmployerDetailsQuery,
  getProfilePictureQuery,
  deleteProfilePictureQuery,
} from "../queries/userQueries.js";

export const findEmployerProfileByUserId = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM employer WHERE user_id = ?",
    [userId]
  );
  return rows;
};

export const createEmployerProfileRecord = async (
  userId,
  company_name,
  company_address,
  company_website,
  contact_number,
  industry,
  description,
  profilePictureUrl
) => {
  await pool.query(insertEmployerDetailsQuery, [
    userId,
    company_name,
    company_address,
    company_website,
    contact_number,
    industry,
    description,
    profilePictureUrl,
  ]);
};

export const getEmployerDetailsByUserId = async (userId) => {
  const [rows] = await pool.query(getEmployerDetailsQuery, [userId]);
  return rows;
};

export const updateEmployerDetailsRecord = async (
  userId,
  fields,
  values
) => {
  const query = updateEmployerDetailsQuery(fields.map((f) => `${f} = ?`));
  await pool.query(query, [...values, userId]);
};

export const getEmployerProfilePicture = async (userId) => {
  const [rows] = await pool.query(getProfilePictureQuery, [userId]);
  return rows;
};

export const deleteEmployerProfilePicture = async (userId) => {
  await pool.query(deleteProfilePictureQuery, [userId]);
};
