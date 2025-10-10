//Insert Employer Details
export const insertEmployerDetailsQuery = `
  INSERT INTO employers
    (user_id, company_name, company_address, company_website, contact_number, industry, description, profilePictureUrl)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

//Get Employer Details
export const getEmployerDetailsQuery = `
  SELECT e.*, u.userName, u.email
  FROM employers e
  JOIN users u ON e.user_id = u.user_id
  WHERE e.user_id = ?
`;

//Update Employer Details
export const updateEmployerDetailsQuery = (fields) => `
  UPDATE employers SET ${fields.join(", ")} WHERE user_id = ?
`;

// Get current profile picture (before deleting)
export const getProfilePictureQuery = `
  SELECT profile_picture FROM employers WHERE user_id = ?
`;

// Remove profile picture only
export const deleteProfilePictureQuery = `
  UPDATE employers SET profile_picture = NULL WHERE user_id = ?
`;

