<<<<<<< HEAD
export const CREATE_JOB = `
    INSERT INTO jobs (employer_id, title, description, location, salary, job_type, company_logo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
=======
export const insertJobQuery = `
  INSERT INTO jobs (
    employer_id, title, description, location, work_type, job_type, experience_level, industry, salary_min, salary_max, company_logo, status )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
`;
>>>>>>> 476eef00d4a03339a9e202e68fcbb23bb924d58f

export const getJobsQuery = `
  SELECT * FROM jobs WHERE status = 'approved'
`;

export const getJobByIdQuery = `
  SELECT * FROM jobs WHERE job_id = ? AND status = 'approved'
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
  SELECT * FROM jobs WHERE employer_id=?
`;