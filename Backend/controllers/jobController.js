import cloudinary from "../utils/cloudinary.js";
import { sendEmail } from "../utils/emailClient.js";
import {
  createJobRecord,
  findApprovedJobs,
  findApprovedJobById,
  findJobsByEmployerId,
  updateJobRecord,
  deleteJobRecord,
  findJobById,
  updateJobStatus,
  findApprovedJobsByCompany,
  incrementJobViews,
} from "../models/jobModel.js";
import { findEmployerProfileByUserId } from "../models/employerModel.js";
import { findUserEmailById } from "../models/userModel.js";

const uploadFromBuffer = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

const STATUS_LABELS = {
  approved: "Approved",
  pending: "Pending review",
  rejected: "Rejected",
  closed: "Closed",
};

const toSafeNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normaliseJobForDashboard = (job = {}) => {
  if (!job) return null;

  const status = (job.status || "pending").toString().toLowerCase();
  const views = toSafeNumber(
    job.views ?? job.view_count ?? job.total_views ?? job.viewsCount
  );
  const applicants = toSafeNumber(
    job.applicants ?? job.applicants_count ?? job.total_applicants ?? job.applicationsCount
  );
  const conversionValue = views > 0 ? applicants / views : 0;
  const conversionRate = views > 0 ? `${Math.round(conversionValue * 100)}%` : "—";

  const tags = [job.work_type, job.job_type, job.experience_level, job.industry]
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);

  return {
    id: job.job_id ?? job.id ?? null,
    title: job.title ?? "Untitled role",
    location: job.location ?? "Location not specified",
    status,
    statusLabel: STATUS_LABELS[status] ?? STATUS_LABELS.pending,
    workType: job.work_type ?? null,
    jobType: job.job_type ?? null,
    experienceLevel: job.experience_level ?? null,
    industry: job.industry ?? null,
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    companyLogo: job.company_logo ?? null,
    createdAt: job.created_at ?? job.createdAt ?? null,
    updatedAt: job.updated_at ?? job.updatedAt ?? null,
    views,
    applicants,
    conversionRate,
    conversionValue,
    tags,
    raw: job,
  };
};

const computeJobStats = (jobs = []) => {
  if (!jobs.length) {
    return {
      totalJobs: 0,
      totalViews: 0,
      totalApplicants: 0,
      averageViews: 0,
      topViewedJobId: null,
      topConversionJobId: null,
    };
  }

  let totalViews = 0;
  let totalApplicants = 0;
  let topViewedJob = null;
  let topConversionJob = null;

  jobs.forEach((job) => {
    totalViews += job.views;
    totalApplicants += job.applicants;

    if (!topViewedJob || job.views > topViewedJob.views) {
      topViewedJob = job;
    }

    if (!topConversionJob || job.conversionValue > topConversionJob.conversionValue) {
      topConversionJob = job;
    }
  });

  return {
    totalJobs: jobs.length,
    totalViews,
    totalApplicants,
    averageViews: jobs.length ? Math.round(totalViews / jobs.length) : 0,
    topViewedJobId: topViewedJob?.id ?? null,
    topConversionJobId: topConversionJob?.id ?? null,
  };
};

export const createJob = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ error: "Request body is required to create a job" });
    }

    const employerId = req.user.id;

    const profile = await findEmployerProfileByUserId(employerId);

    if (profile.length === 0) {
      return res
        .status(400)
        .json({ error: "Please complete your employer profile first." });
    }

    const {
      title,
      description,
      location,
      work_type,
      job_type,
      experience_level,
      industry,
      salary_min,
      salary_max,
    } = req.body;

    if (!title || !description || !location || !industry) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    if (salary_min === undefined || salary_max === undefined) {
      return res
        .status(400)
        .json({ error: "Salary range (salary_min, salary_max) is required" });
    }

    let logoUrl = null;
    if (req.file) {
      const uploadResult = await uploadFromBuffer(
        req.file.buffer,
        "company/logos"
      );
      logoUrl = uploadResult.secure_url;
    }

    const insertResult = await createJobRecord([
      employerId,
      title.trim(),
      description,
      location,
      (work_type || "onsite").toLowerCase(),
      (job_type || "full-time").toLowerCase(),
      (experience_level || "entry").toLowerCase(),
      industry,
      salary_min,
      salary_max,
      logoUrl,
    ]);

    let jobPayload = null;

    if (insertResult?.insertId) {
      const createdJobs = await findJobById(insertResult.insertId);
      if (createdJobs.length > 0) {
        jobPayload = normaliseJobForDashboard(createdJobs[0]);
      }
    }

    res.status(201).json({
      message: "Job created successfully and waiting for admin approval.",
      job: jobPayload,
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Server error while creating job" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await findApprovedJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await findApprovedJobById(id);

    if (job.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    let jobRecord = job[0];

    try {
      await incrementJobViews(id);
      const previousViews = Number(
        jobRecord.views ??
          jobRecord.view_count ??
          jobRecord.total_views ??
          0
      );
      const updatedViews = Number.isFinite(previousViews)
        ? previousViews + 1
        : 1;
      jobRecord = {
        ...jobRecord,
        views: updatedViews,
      };
    } catch (viewError) {
      console.error("Failed to increment job views", viewError);
    }

    res.json(jobRecord);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching job" });
  }
};

export const getJobsByEmployer = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobRows = await findJobsByEmployerId(employerId);
    const jobs = jobRows.map((job) => normaliseJobForDashboard(job)).filter(Boolean);
    const stats = computeJobStats(jobs);

    res.json({ jobs, stats });
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching jobs" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    const fields = [];
    const values = [];

    if (req.file) {
      const uploadResult = await uploadFromBuffer(
        req.file.buffer,
        "company/logos"
      );
      fields.push("company_logo=?");
      values.push(uploadResult.secure_url);
    }

    const editableFields = [
      "title",
      "description",
      "location",
      "work_type",
      "job_type",
      "experience_level",
      "industry",
      "salary_min",
      "salary_max",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fields.push(`${field}=?`);
        values.push(req.body[field]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const result = await updateJobRecord(fields, values, id, employerId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    let updatedJob = null;
    const jobs = await findJobById(id);
    if (jobs.length > 0) {
      updatedJob = normaliseJobForDashboard(jobs[0]);
    }

    res.status(200).json({
      message: "Job updated successfully and waiting for admin approval.",
      job: updatedJob,
    });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Server error while updating job" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { id } = req.params;

    const result = await deleteJobRecord(id, employerId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    const jobRows = await findJobsByEmployerId(employerId);
    const jobs = jobRows.map((job) => normaliseJobForDashboard(job)).filter(Boolean);
    const stats = computeJobStats(jobs);

    res.json({ message: "Job deleted successfully", jobs, stats });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting job" });
  }
};

export const approveJob = async (req, res) => {
  const { jobId } = req.params;
  const { status } = req.body;

  if (status !== "approved" && status !== "rejected") {
    return res.status(400).json({
      error: "Invalid status. Use approved or rejected.",
    });
  }

  try {
    const jobs = await findJobById(jobId);

    if (jobs.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    await updateJobStatus(status, jobId);

    const employer = await findUserEmailById(jobs[0].employer_id);

    if (employer.length > 0) {
      await sendEmail({
        to: employer[0].email,
        subject: `Your job "${jobs[0].title}" has been ${status}`,
        text: `Hello, your job posting "${jobs[0].title}" has been ${status} by the admin.`,
      });
    }

    res.status(200).json({
      message: `Job ${status} successfully${
        employer.length > 0 ? " and email sent to employer" : ""
      }.`,
    });
  } catch (err) {
    console.error("Approve job error:", err);
    res.status(500).json({ error: "Server error while approving job" });
  }
};
// Get Jobs by specific Company (approved jobs only)
export const getJobsByCompany = async (req, res) => {
  try {
    const { employerId } = req.params;
    const jobs = await findApprovedJobsByCompany(employerId);

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No approved jobs found for this company." });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching company jobs:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching company jobs." });
  }
};
