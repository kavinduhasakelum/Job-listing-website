-- Update job_applications status enum to include more status options
-- This adds Reviewed, Shortlisted, and Interviewed statuses

ALTER TABLE job_applications 
MODIFY COLUMN status ENUM('Pending','Reviewed','Shortlisted','Approved','Rejected','Interviewed') 
DEFAULT 'Pending';
