
export const insertJobQuery = `
  INSERT INTO jobs (
    employer_id, title, description, location, work_type, job_type, experience_level, industry, salary_min, salary_max, company_logo, status )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
`;


export const getJobsQuery = `
  SELECT * FROM jobs WHERE status = 'approved'
`;

export const getJobByIdQuery = `
  SELECT * FROM jobs WHERE job_id = ? AND status = 'approved'
`;

export const incrementJobViewsQuery = `
  UPDATE jobs
  SET views = COALESCE(views, 0) + 1
  WHERE job_id = ?
`;

export const updateJobQuery = (fields) => `
  UPDATE jobs
  SET ${fields.join(", ")}, status='pending'
  WHERE job_id=? AND employer_id=?
`;

export const deleteJobQuery = `
  DELETE FROM jobs WHERE job_id=? AND employer_id=?
`;

export const getJobsByEmployerQuery = `
  SELECT *
  FROM jobs
  WHERE employer_id = ?
  ORDER BY created_at DESC
`;

export const getApprovedJobsByCompanyQuery = `
  SELECT * FROM jobs WHERE employer_id=? AND status = 'approved'
`;

export const checkExistingSavedJobQuery = `
  SELECT 1 FROM saved_jobs WHERE jobseeker_id = ? AND job_id = ?
`;

export const insertSavedJobQuery = `
  INSERT INTO saved_jobs (jobseeker_id, job_id) VALUES (?, ?)
`;

export const getSavedJobsByJobseekerQuery = `
  SELECT j.*
  FROM saved_jobs s
  JOIN jobs j ON s.job_id = j.job_id
  WHERE s.jobseeker_id = ?
  ORDER BY s.created_at DESC
`;

export const removeSavedJobQuery = `
  DELETE FROM saved_jobs WHERE jobseeker_id = ? AND job_id = ?
`;

export const findSeekerByUserIdQuery = `
  SELECT seeker_id FROM job_seeker WHERE user_id = ?
`;

export const findApprovedJobByIdQuery = `
  SELECT * FROM jobs WHERE job_id = ? AND status = 'approved'
`;

export const checkExistingApplicationQuery = `
  SELECT * FROM job_applications WHERE job_id = ? AND seeker_id = ?
`;

export const insertJobApplicationQuery = `
  INSERT INTO job_applications (job_id, seeker_id, cover_letter, resume_url)
  VALUES (?, ?, ?, ?)
`;

export const getSeekerIdByUserIdQuery = `
  SELECT seeker_id FROM job_seeker WHERE user_id = ?
`;

export const getApplicationsBySeekerIdQuery = `
  SELECT 
    a.application_id,
    a.status,
    a.applied_at,
    j.title,
    j.location,
    j.company_logo
  FROM job_applications a
  JOIN jobs j ON a.job_id = j.job_id
  WHERE a.seeker_id = ?
  ORDER BY a.applied_at DESC
`;

export const verifyJobOwnershipQuery = `
  SELECT * FROM jobs WHERE job_id = ? AND employer_id = ?
`;

export const getApplicantsByJobIdQuery = `
  SELECT 
    a.application_id, 
    a.status, 
    a.applied_at,
    js.full_name AS jobseeker_name,
    u.email AS jobseeker_email,
    a.cover_letter, 
    a.resume_url
  FROM job_applications a
  JOIN job_seeker js ON a.seeker_id = js.seeker_id
  JOIN users u ON js.user_id = u.user_id
  WHERE a.job_id = ?
`;

export const getApplicationDetailsQuery = `
  SELECT 
    a.application_id,
    a.job_id,
    j.title AS job_title,
    j.employer_id,
    u.email,
    u.userName AS jobseeker_name
  FROM job_applications a
  JOIN jobs j ON a.job_id = j.job_id
  JOIN job_seeker js ON a.seeker_id = js.seeker_id
  JOIN users u ON js.user_id = u.user_id
  WHERE a.application_id = ?
`;

export const updateApplicationStatusQuery = `
  UPDATE job_applications SET status = ? WHERE application_id = ?
`;