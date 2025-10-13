import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaFileUpload, FaCheck } from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const JobApplicationModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug log when modal opens
  useEffect(() => {
    if (isOpen) {
      console.clear(); // Clear previous logs for clarity
      console.log("=== JOB APPLICATION MODAL OPENED ===");
      console.log("Modal isOpen:", isOpen);
      console.log("Job prop received:", job);
      console.log("Job ID variations:");
      console.log("  - job.id:", job?.id);
      console.log("  - job.job_id:", job?.job_id);
      console.log("  - job.jobId:", job?.jobId);
      console.log("  - job.raw?.job_id:", job?.raw?.job_id);
      console.log("Full job object:", JSON.stringify(job, null, 2));
      console.log("====================================");
      
      // Also check if there's an issue with the job object
      if (!job || (!job.id && !job.job_id && !job.jobId && !job.raw?.job_id)) {
        console.error("⚠️ WARNING: Job object has no valid ID!");
        console.error("This will cause the application to fail.");
      }
    }
  }, [isOpen, job]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["application/pdf"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF file");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      setResume(file);
      setResumeFileName(file.name);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Get job ID with fallback options
    const jobId = job.id || job.job_id || job.jobId || job.raw?.job_id;
    
    console.log("===========================================");
    console.log("📤 Submitting Job Application");
    console.log("===========================================");
    console.log("Job ID extracted:", jobId);
    console.log("Job object received:", job);
    console.log("All ID options:");
    console.log("  - job.id:", job.id);
    console.log("  - job.job_id:", job.job_id);
    console.log("  - job.jobId:", job.jobId);
    console.log("  - job.raw?.job_id:", job.raw?.job_id);
    console.log("===========================================");
    
    if (!jobId) {
      setError("Unable to determine job ID. Please try again.");
      return;
    }

    // Validate resume
    if (!resume) {
      setError("Please upload your resume");
      return;
    }

    // Validate cover letter (optional but recommended)
    if (coverLetter.trim().length > 2000) {
      setError("Cover letter must be less than 2000 characters");
      return;
    }

    try {
      setLoading(true);

      // Create form data
      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("cover_letter", coverLetter.trim());
      formData.append("resume", resume);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to apply for jobs");
        setLoading(false);
        return;
      }

      console.log("📍 API Endpoint:", `${API_BASE_URL}/job/${jobId}/apply`);
      console.log("📦 Form Data:");
      console.log("  - job_id:", jobId);
      console.log("  - cover_letter length:", coverLetter.trim().length);
      console.log("  - resume:", resume?.name);
      console.log("===========================================");

      // Submit application
      const response = await axios.post(
        `${API_BASE_URL}/job/${jobId}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Success
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Reset form and close modal
      setCoverLetter("");
      setResume(null);
      setResumeFileName("");
      onClose();
    } catch (err) {
      console.error("Application error:", err);
      console.error("- Error status:", err.response?.status);
      console.error("- Error data:", err.response?.data);
      console.error("- Error message:", err.message);
      
      // Check if it's a profile requirement error
      if (err.response?.status === 403 && err.response?.data?.action) {
        // Profile not found - redirect to profile creation
        setError(err.response.data.error || "Please create your profile first");
        setTimeout(() => {
          onClose();
          window.location.href = "/jobseeker/profile";
        }, 2000);
        return;
      }
      
      // Handle 404 error specifically
      if (err.response?.status === 404) {
        setError("Job not found. The job may have been removed or is no longer available.");
        return;
      }
      
      // Handle 400 error (job not approved or already applied)
      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.error || "Unable to submit application";
        if (err.response?.data?.jobStatus) {
          // Job exists but not approved
          setError(`${errorMsg} (Job Status: ${err.response.data.jobStatus})`);
        } else {
          setError(errorMsg);
        }
        return;
      }
      
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to submit application. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCoverLetter("");
      setResume(null);
      setResumeFileName("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Apply for {job?.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {job?.company} · {job?.location}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Cover Letter */}
            <div>
              <label
                htmlFor="coverLetter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Cover Letter <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this role..."
                rows={6}
                maxLength={2000}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-50 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                {coverLetter.length}/2000 characters
              </p>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Resume <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label
                  htmlFor="resume"
                  className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-4 transition-colors ${
                    resume
                      ? "border-green-400 bg-green-50"
                      : "border-slate-300 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/30"
                  } ${loading ? "pointer-events-none opacity-50" : ""}`}
                >
                  {resume ? (
                    <>
                      <FaCheck className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {resumeFileName}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaFileUpload className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Click to upload your resume (PDF, Max 5MB)
                      </span>
                    </>
                  )}
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
                {resume && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setResume(null);
                      setResumeFileName("");
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove file
                  </button>
                )}
              </div>
            </div>

            {/* Info Message */}
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-medium">Before you apply:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-xs">
                <li>Make sure your resume is up to date</li>
                <li>Your application will be sent directly to the employer</li>
                <li>You can track your application status in your dashboard</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !resume}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Submitting...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;
