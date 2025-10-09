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

    await createJobRecord([
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

    res.status(201).json({
      message: "Job created successfully and waiting for admin approval.",
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

    res.json(job[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching job" });
  }
};

export const getJobsByEmployer = async (req, res) => {
  try {
  const employerId = req.user.id;
  const jobs = await findJobsByEmployerId(employerId);
  res.json(jobs);
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

    res.status(200).json({
      message: "Job updated successfully and waiting for admin approval.",
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
      return res
        .status(404)
        .json({ error: "Job not found or not authorized" });
    }

    res.json({ message: "Job deleted successfully" });
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
