import pool from "../config/dbConnection.js";
import {
  CREATE_USER,
  FIND_USER_BY_EMAIL,
  FIND_USER_BY_NAME,
  DELETE_USER_BY_ID,
  SOFT_DELETE_USER_BY_ID,
  GET_ALL_USERS,
  GET_ACTIVE_USERS,
  GET_INACTIVE_USERS,
  GET_USER_BY_ID_ALL,
  GET_ACTIVE_USER_BY_ID,
  GET_INACTIVE_USER_BY_ID,
  GET_USER_PROFILE_BY_ID,
} from "../queries/authQueries.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(FIND_USER_BY_EMAIL, [email]);
  return rows;
};

export const findUserByName = async (name) => {
  const [rows] = await pool.query(FIND_USER_BY_NAME, [name]);
  return rows;
};

export const createUser = async ({ name, email, password, role }) => {
  await pool.query(CREATE_USER, [name, email, password, role]);
};

export const getUserProfileById = async (userId) => {
  const [rows] = await pool.query(GET_USER_PROFILE_BY_ID, [userId]);
  return rows;
};

export const getAllUsers = async () => {
  const [rows] = await pool.query(GET_ALL_USERS);
  return rows;
};

export const getActiveUsers = async () => {
  const [rows] = await pool.query(GET_ACTIVE_USERS);
  return rows;
};

export const getInactiveUsers = async () => {
  const [rows] = await pool.query(GET_INACTIVE_USERS);
  return rows;
};

export const getUserByIdAll = async (userId) => {
  const [rows] = await pool.query(GET_USER_BY_ID_ALL, [userId]);
  return rows;
};

export const getActiveUserById = async (userId) => {
  const [rows] = await pool.query(GET_ACTIVE_USER_BY_ID, [userId]);
  return rows;
};

export const getInactiveUserById = async (userId) => {
  const [rows] = await pool.query(GET_INACTIVE_USER_BY_ID, [userId]);
  return rows;
};

export const softDeleteUserById = async (userId) => {
  await pool.query(SOFT_DELETE_USER_BY_ID, [userId]);
};

export const deleteUserById = async (userId) => {
  await pool.query(DELETE_USER_BY_ID, [userId]);
};

export const findEmployerProfile = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows;
};

export const updateUserPassword = async (password, email) => {
  const [result] = await pool.query("UPDATE users SET password = ? WHERE email = ?", [
    password,
    email,
  ]);
  return result;
};

export const findUserByEmailCaseInsensitive = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows;
};

export const updatePasswordByUserId = async (password, userId) => {
  const [result] = await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
    password,
    userId,
  ]);
  return result;
};

export const findUserEmailById = async (userId) => {
  const [rows] = await pool.query("SELECT email FROM users WHERE user_id = ?", [
    userId,
  ]);
  return rows;
};

export const verifyUserEmailIfPending = async (email) => {
  const [result] = await pool.query(
    "UPDATE users SET is_verified = 1 WHERE email = ? AND is_verified = 0",
    [email]
  );
  return result;
};

export const findUsersByRole = async (role) => {
  const [rows] = await pool.query(
    "SELECT user_id, userName, email, role, is_verified, created_at FROM users WHERE role = ?",
    [role]
  );
  return rows;
};

export const findUserPasswordHashById = async (userId) => {
  const [rows] = await pool.query(
    "SELECT password FROM users WHERE user_id = ?",
    [userId]
  );
  return rows;
};
