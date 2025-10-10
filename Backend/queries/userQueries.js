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

// Insert Job Seeker Details
export const insertJobSeekerDetailsQuery = `
  INSERT INTO job_seeker
    (user_id, full_name, address, contact_number, birthday, gender, profile_picture)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// Get Job Seeker Details
export const getJobSeekerDetailsQuery = `
  SELECT j.*, u.userName, u.email
  FROM job_seeker j
  JOIN users u ON j.user_id = u.user_id
  WHERE j.user_id = ?
`;

// Update Job Seeker Details
export const updateJobSeekerDetailsQuery = (fields) => `
  UPDATE job_seeker SET ${fields.join(", ")} WHERE user_id = ?
`;

// Delete Job Seeker Profile Picture
export const deleteJobSeekerProfilePictureQuery = `
  UPDATE job_seeker SET profile_picture = NULL WHERE user_id = ?
`;