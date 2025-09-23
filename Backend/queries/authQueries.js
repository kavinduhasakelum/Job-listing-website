// Create user
export const CREATE_USER = `
  INSERT INTO users (userName, email, password, role)
  VALUES (?, ?, ?, ?)
`;

// Find user by email
export const FIND_USER_BY_EMAIL = `
  SELECT * FROM users WHERE email = ?
`;

// Find user by name
export const FIND_USER_BY_NAME = `
  SELECT * FROM users WHERE userName = ?
`;

// Delete (hard)
export const DELETE_USER_BY_ID = `
  DELETE FROM users WHERE user_id = ?
`;

// Soft delete
export const SOFT_DELETE_USER_BY_ID = `
  UPDATE users SET is_deleted = TRUE WHERE user_id = ?
`;

// View all users (both active and deleted)
export const GET_ALL_USERS = `
  SELECT user_id, userName, email, role, is_deleted, created_at FROM users
`;

// View only active users
export const GET_ACTIVE_USERS = `
  SELECT user_id, userName, email, role, created_at FROM users WHERE is_deleted = FALSE
`;

// View only inactive (soft-deleted) users
export const GET_INACTIVE_USERS = `
  SELECT user_id, userName, email, role, created_at FROM users WHERE is_deleted = TRUE
`;

// View any user by user_id (active or deleted)
export const GET_USER_BY_ID_ALL = `
  SELECT user_id, userName, email, role, is_deleted, created_at FROM users WHERE user_id = ?
`;

// View active user by user_id
export const GET_ACTIVE_USER_BY_ID = `
  SELECT user_id, userName, email, role, created_at FROM users WHERE user_id = ? AND is_deleted = FALSE
`;

// View inactive user by user_id
export const GET_INACTIVE_USER_BY_ID = `
  SELECT user_id, userName, email, role, created_at FROM users WHERE user_id = ? AND is_deleted = TRUE
`; 