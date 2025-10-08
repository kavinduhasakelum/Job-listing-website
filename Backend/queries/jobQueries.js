export const CREATE_JOB = `
    INSERT INTO jobs (employer_id, title, description, location, salary, job_type, company_logo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

export const GET_ALL_JOBS = `
    SELECT * FROM jobs
  `;

export const GET_JOB_BY_ID = `
    SELECT * FROM jobs WHERE job_id = ?
  `;

export const GET_EMPLOYER_JOBS = `
    SELECT * FROM jobs WHERE employer_id = ?
  `;

export const UPDATE_JOB = `
    UPDATE jobs
    SET title=?, description=?, location=?, salary=?, job_type=?
    WHERE job_id=? AND employer_id=?
  `;

export const DELETE_JOB = `
    DELETE FROM jobs WHERE job_id=? AND employer_id=?
  `;