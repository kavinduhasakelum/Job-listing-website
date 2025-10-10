import React, { useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const WORK_TYPES = [
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  industry: "",
  workType: WORK_TYPES[0].value,
  jobType: JOB_TYPES[0].value,
  experienceLevel: EXPERIENCE_LEVELS[0].value,
};

function JobForm() {
  const { isAuthenticated, isEmployer, isAdmin, loading } = useAuth();

  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const fileInputRef = useRef(null);

  const canPostJob = useMemo(() => {
    if (!isAuthenticated) return false;

    const employerAllowed =
      typeof isEmployer === "function" ? isEmployer() : false;
    const adminAllowed = typeof isAdmin === "function" ? isAdmin() : false;

    return employerAllowed || adminAllowed;
  }, [isAuthenticated, isEmployer, isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
  };

  const resetForm = () => {
    setFormValues(INITIAL_FORM);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canPostJob) {
      setStatus({
        type: "error",
        message:
          "You need an employer or admin account to post a job. Please contact support if you believe this is a mistake.",
      });
      return;
    }

    if (!formValues.industry.trim()) {
      setStatus({
        type: "error",
        message: "Industry is required to submit a job post.",
      });
      return;
    }

    setStatus({ type: null, message: "" });
    setSubmitting(true);

    const payload = new FormData();
    payload.append("title", formValues.title.trim());
    payload.append("description", formValues.description.trim());
    payload.append("location", formValues.location.trim());
    payload.append("industry", formValues.industry.trim());
    payload.append("work_type", formValues.workType);
    payload.append("job_type", formValues.jobType);
    payload.append("experience_level", formValues.experienceLevel);
    payload.append("salary_min", formValues.salaryMin || "");
    payload.append("salary_max", formValues.salaryMax || "");

    if (logoFile) {
      payload.append("company_logo", logoFile);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/jobs/create`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus({
        type: "success",
        message:
          response.data?.message ||
          "Job created successfully. A confirmation has been emailed.",
      });
      resetForm();
    } catch (error) {
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "We couldn't create the job right now. Please try again.";

      setStatus({ type: "error", message: apiMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Share your opportunity
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide clear details so the right candidates apply. Fields marked with
          * are required.
        </p>
      </div>

      {status.type && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {status.message}
        </div>
      )}

      {!loading && !canPostJob && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Only employer or admin accounts can publish job posts.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Job title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Senior Frontend Engineer"
          className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          value={formValues.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="location"
          className="text-sm font-medium text-gray-700"
        >
          Location *
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Remote · Colombo, Sri Lanka"
          className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          value={formValues.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="industry"
            className="text-sm font-medium text-gray-700"
          >
            Industry *
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            placeholder="e.g. Information Technology"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={formValues.industry}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="workType"
            className="text-sm font-medium text-gray-700"
          >
            Work setting *
          </label>
          <select
            id="workType"
            name="workType"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={formValues.workType}
            onChange={handleChange}
          >
            {WORK_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="jobType"
            className="text-sm font-medium text-gray-700"
          >
            Job type *
          </label>
          <select
            id="jobType"
            name="jobType"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={formValues.jobType}
            onChange={handleChange}
          >
            {JOB_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="experienceLevel"
            className="text-sm font-medium text-gray-700"
          >
            Experience level *
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={formValues.experienceLevel}
            onChange={handleChange}
          >
            {EXPERIENCE_LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Outline responsibilities, must-have skills, and the impact they'll make..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          value={formValues.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="salaryMin"
            className="text-sm font-medium text-gray-700"
          >
            Salary minimum (optional)
          </label>
          <input
            id="salaryMin"
            name="salaryMin"
            type="number"
            min="0"
            placeholder="e.g. 75000"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={formValues.salaryMin}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="salaryMax"
            className="text-sm font-medium text-gray-700"
          >
            Salary maximum (optional)
          </label>
          <input
            id="salaryMax"
            name="salaryMax"
            type="number"
            min="0"
            placeholder="e.g. 110000"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={formValues.salaryMax}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="company_logo" className="text-sm font-medium text-gray-700">
          Company logo (optional)
        </label>
        <input
          ref={fileInputRef}
          id="company_logo"
          name="company_logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-purple-600 hover:file:bg-purple-200"
        />
        <p className="text-xs text-gray-500">
          PNG, JPG up to 2MB. We recommend a square logo for the best results.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || loading}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting || loading ? "Publishing..." : "Publish job"}
        </button>
      </div>
    </form>
  );
}

export default JobForm;
