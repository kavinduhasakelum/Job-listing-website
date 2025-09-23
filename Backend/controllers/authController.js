import pool from "../config/dbconnection.js";
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

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    const {  name_or_email, password } = req.body;

    if (!name_or_email || !password) {
        return res.status(400).json({ error: 'Invalid Login' });
    }

    try {
        const [users1] = await pool.query(FIND_USER_BY_EMAIL, [name_or_email]);
        const [users2] = await pool.query(FIND_USER_BY_NAME, [name_or_email]);

        if (users1.length === 0 && users2.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        let user=null;
        if (users1.length === 0){
            user = users2[0];
        }else {   
            user= users1[0];
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

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