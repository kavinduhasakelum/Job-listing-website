import pool from "../config/dbconnection.js";
import cloudinary from "../utils/cloudinary.js";
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
    GET_INACTIVE_USER_BY_ID
} from '../queries/authQueries.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';

const ALLOWED_ROLES = ['admin', 'employer', 'jobseeker'];

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedRole = role.toLowerCase();

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
        return res.status(400).json({ error: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}` });
    }

    try {
        // Check if user already exists
        const [existing] = await pool.query(FIND_USER_BY_EMAIL, [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashed = await hashPassword(password);
        await pool.query(CREATE_USER, [name, email, hashed, normalizedRole]);

        res.status(201).json({ message: 'User registered successfully. A verification email has been sent. Please check your inbox and click the verification link to activate your account.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const verifyLink = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`,
    });
};


export const login = async (req, res) => {
    const {  name_or_email, password } = req.body;

    if (!name_or_email || !password) {
        return res.status(400).json({ error: 'Invalid Login' });
    }

    try {
        // Check user by email or username
        const [users1] = await pool.query(FIND_USER_BY_EMAIL, [name_or_email]);
        const [users2] = await pool.query(FIND_USER_BY_NAME, [name_or_email]);

        if (users1.length === 0 && users2.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // pick the found user
        let user=null;
        if (users1.length === 0){
            user = users2[0];
        }else {   
            user= users1[0];
        }

        // Check email verification
        if (user.is_verified !== 1) {
        return res.status(403).json({ error: "Please verify your email before logging in." });
        }

         // Check password
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View All Users (including deleted)
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(GET_ALL_USERS);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Active Users
export const getActiveUsers = async (req, res) => {
    try {
        const [users] = await pool.query(GET_ACTIVE_USERS);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Inactive (soft-deleted) Users
export const getInactiveUsers = async (req, res) => {
    try {
        const [users] = await pool.query(GET_INACTIVE_USERS);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Any User by ID
export const getUserByIdAll = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.query(GET_USER_BY_ID_ALL, [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Active User by ID
export const getActiveUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.query(GET_ACTIVE_USER_BY_ID, [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Active user not found' });
        }
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Inactive User by ID
export const getInactiveUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.query(GET_INACTIVE_USER_BY_ID, [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Inactive user not found' });
        }
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Soft Delete User (any authenticated user can delete their own account)
export const softDeleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [user] = await pool.query(GET_ACTIVE_USER_BY_ID, [id]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await pool.query(SOFT_DELETE_USER_BY_ID, [id]);
        res.json({ message: 'User soft deleted (marked as deleted)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hard Delete (admin only)
export const hardDeleteUser = async (req, res) => {
    const { id } = req.params;

    // Assuming req.user.role is set by auth middleware
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can perform hard delete' });
    }

    try {
        const [user] = await pool.query(GET_USER_BY_ID_ALL, [id]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await pool.query(DELETE_USER_BY_ID, [id]);
        res.json({ message: 'User permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send email helper
const transporter = nodemailer.createTransport({
  service: "Gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send verification email
export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Backend API verification link
    const link = `http://localhost:3000/auth/verify-email?token=${token}`;

    // Send mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
    });

    res.json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify email (automatic when user clicks)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("<h3>Invalid verification link</h3>");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update only if not verified already
    const [result] = await pool.query(
      "UPDATE users SET is_verified = 1 WHERE email = ? AND is_verified = 0",
      [decoded.email]
    );

    if (result.affectedRows === 0) {
      return res.status(400).send("<h3>Email already verified or user not found.</h3>");
    }

    res.send("<h3>Email verified successfully ✅. You can now log in.</h3>");
  } catch (err) {
    res.status(400).send("<h3>Invalid or expired verification link ❌</h3>");
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase();

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    // Include both email + user_id in token
    const token = jwt.sign(
      { email: normalizedEmail, user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const normalizedEmail = decoded.email.toLowerCase();

    // Check if user exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found for this email" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update DB
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, normalizedEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Password not updated" });
    }

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new password are required" });
    }

    // Get current password
    const [rows] = await pool.query("SELECT password FROM users WHERE user_id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentPassword = rows[0].password;

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, userId]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};