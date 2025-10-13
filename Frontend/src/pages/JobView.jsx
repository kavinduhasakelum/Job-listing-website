import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Button from "../components/Button";
import JobApplicationModal from "../components/JobApplicationModal";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const toTitleCase = (value) => {
  if (!value) return null;
  return value
    .toString()
    .split(" ")
    .map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
    )
    .join(" ");
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatSalaryRange = (min, max) => {
  const minNum = parseNumber(min);
  const maxNum = parseNumber(max);

  if (minNum !== null && maxNum !== null) {
    return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
  }
  if (minNum !== null) {
    return `From ${minNum.toLocaleString()}`;
  }
  if (maxNum !== null) {
    return `Up to ${maxNum.toLocaleString()}`;
  }
  return "Not specified";
};

const formatRelativeTime = (input) => {
  if (!input) return "recently";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "recently";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) {
    const minutes = Math.round(diffMs / minute);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diffMs < day) {
    const hours = Math.round(diffMs / hour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffMs < month) {
    const days = Math.round(diffMs / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (diffMs < year) {
    const months = Math.round(diffMs / month);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  const years = Math.round(diffMs / year);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

const normaliseJob = (job = {}) => {
  const raw = job.raw ?? job;
  const workTypeRaw = raw.work_type ?? raw.workType;
  const jobTypeRaw = raw.job_type ?? raw.jobType;
  const experienceRaw = raw.experience_level ?? raw.experienceLevel;
  const industryRaw = raw.industry ?? raw.department;

  const workType = toTitleCase(workTypeRaw);
  const jobType = toTitleCase(jobTypeRaw);
  const experienceLevel = toTitleCase(experienceRaw);
  const industry = toTitleCase(industryRaw);

  const salaryMin = raw.salary_min ?? raw.salaryMin ?? null;
  const salaryMax = raw.salary_max ?? raw.salaryMax ?? null;
  const createdAt = raw.created_at ?? raw.createdAt ?? raw.posted_at;

  return {
    id:
      raw.job_id ??
      raw.id ??
      raw.jobId ??
      raw.ID ??
      raw.uuid ??
      raw.slug ??
      null,
    title: raw.title ?? "Untitled role",
    company:
      raw.company ??
      raw.company_name ??
      raw.companyName ??
      raw.employer_name ??
      "Company confidential",
    location: raw.location ?? raw.city ?? "Location unspecified",
    description: raw.description ?? "",
    salaryRange: formatSalaryRange(salaryMin, salaryMax),
    salaryMin,
    salaryMax,
    workType,
    jobType,
    experienceLevel,
    industry,
    createdAt,
    postedRelative: formatRelativeTime(createdAt),
    companyLogo: raw.company_logo ?? raw.companyLogo ?? null,
    tags: [workType, jobType, industry].filter(Boolean),
    raw,
  };
};

function JobView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const jobState = location.state?.job ?? location.state?.jobData ?? null;
  const initialJob = useMemo(
    () => (jobState ? normaliseJob(jobState) : null),
    [jobState]
  );
  const jobIdFromState =
    location.state?.jobId ??
    jobState?.id ??
    jobState?.job_id ??
    jobState?.jobId ??
    null;
  const jobIdFromQuery =
    searchParams.get("jobId") ?? searchParams.get("id") ?? null;

  const resolvedJobId = (jobIdFromQuery ?? jobIdFromState)?.toString() ?? null;

  // Debug: Log initial page load
  console.log("🔵 JobView Component Loaded");
  console.log("- Job ID from URL:", resolvedJobId);
  console.log("- User:", user);
  console.log("- User role:", user?.role);

  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(Boolean(resolvedJobId) && !initialJob);
  const [error, setError] = useState(initialJob ? null : null);
  const [warning, setWarning] = useState(null);
  
  // Application modal state
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Check if user has already applied for this job
  useEffect(() => {
    const checkApplication = async () => {
      if (!resolvedJobId || !user || user.role !== "jobseeker") {
        return;
      }

      try {
        setCheckingApplication(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(
          `${API_BASE_URL}/job/my/applications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Check if user has applied for this job
        const hasAppliedToJob = data.applications?.some(
          (app) => app.job_id?.toString() === resolvedJobId
        );
        setHasApplied(hasAppliedToJob);
      } catch (err) {
        console.error("Error checking application:", err);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplication();
  }, [resolvedJobId, user]);

  useEffect(() => {
    if (initialJob) {
      setJob((prev) => {
        if (!prev || prev.id !== initialJob.id) {
          return initialJob;
        }
        return prev;
      });
      setWarning(null);
      setError(null);
      setLoading((prev) => (prev && !resolvedJobId ? false : prev));
    }
  }, [initialJob, resolvedJobId]);

  useEffect(() => {
    if (!resolvedJobId) {
      setLoading(false);
      if (initialJob) {
        setJob(initialJob);
        setWarning(
          "This job preview isn't public yet. Share it once the post is published."
        );
        setError(null);
      } else {
        setError("This job is no longer available or the link is invalid.");
      }
      return;
    }

    if (job && job.id?.toString() === resolvedJobId) {
      setWarning(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        setWarning(null);
        const { data } = await axios.get(
          `${API_BASE_URL}/job/${resolvedJobId}`,
          { signal: controller.signal }
        );

        if (!isMounted) return;
        setJob(normaliseJob(data));
        setWarning(null);
      } catch (fetchError) {
        if (!isMounted) return;

        if (axios.isCancel(fetchError)) {
          return;
        }

        const message =
          fetchError.response?.data?.error ||
          fetchError.response?.data?.message ||
          "We couldn't load this job right now.";
        if (initialJob) {
          const fallbackMessage =
            fetchError.response?.status === 404
              ? "This job isn't public yet. You're viewing a private preview."
              : message;
          setWarning(fallbackMessage);
          setError(null);
          setJob(initialJob);
        } else {
          setError(message);
          setJob(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [resolvedJobId, job, initialJob]);

  const descriptionParagraphs = useMemo(() => {
    if (!job?.description) return [];
    return job.description
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [job?.description]);

  const handleApplyClick = async () => {
    console.log("Apply button clicked", { user, userRole: user?.role });
    
    if (!user) {
      // Redirect to login if not authenticated
      console.log("No user, redirecting to login");
      navigate("/register-login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    if (user.role !== "jobseeker") {
      console.log("User is not a job seeker:", user.role);
      setError("Only job seekers can apply for jobs");
      return;
    }

    // Check if user has a profile
    console.log("Checking if user has profile...");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/user/jobseeker/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Profile exists:", response.data);
      // Profile exists, open modal
      setIsApplicationModalOpen(true);
    } catch (err) {
      console.log("Profile check error:", err.response?.status, err.response?.data);
      
      if (err.response?.status === 404) {
        // Profile doesn't exist - show informative message and dialog
        console.log("No profile found, showing dialog");
        setWarning(
          "⚠️ Profile Required: You need to complete your profile before applying for jobs. Your profile helps employers learn about you and is required for all applications."
        );
        
        // Show confirmation dialog immediately
        const confirmed = window.confirm(
          "You haven't created your profile yet.\n\n" +
          "Your profile includes:\n" +
          "• Basic information (name, contact)\n" +
          "• Profile picture (optional)\n" +
          "• Address and birthday\n\n" +
          "Creating a profile is quick and helps employers know more about you.\n\n" +
          "Would you like to create your profile now?"
        );
        
        console.log("User confirmed:", confirmed);
        
        if (confirmed) {
          console.log("Navigating to profile form with state:", {
            returnTo: location.pathname + location.search,
            jobTitle: job?.title
          });
          navigate("/jobseeker/profile", {
            state: { 
              returnTo: location.pathname + location.search,
              jobTitle: job?.title
            }
          });
        }
      } else {
        console.error("Error checking profile:", err);
        setError("Failed to verify profile. Please try again.");
      }
    }
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
    setApplicationSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setApplicationSuccess(false);
    }, 5000);
  };

  const handleCloseModal = () => {
    setIsApplicationModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
        >
          <span aria-hidden>←</span>
          Back to listings
        </button>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-10 text-white">
            {loading ? (
              <div className="flex flex-col gap-4">
                <div className="h-6 w-40 animate-pulse rounded-full bg-white/40" />
                <div className="h-10 w-72 animate-pulse rounded-full bg-white/60" />
                <div className="flex flex-wrap gap-3 pt-2">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="h-7 w-24 animate-pulse rounded-full bg-white/40"
                    />
                  ))}
                </div>
              </div>
            ) : !job && error ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold">Something went wrong</p>
                <p className="text-sm text-white/80">{error}</p>
              </div>
            ) : job ? (
              <div className="flex flex-col gap-6">
                {warning && (
                  <div className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium text-white">
                    {warning}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={`${job.company} logo`}
                      className="h-16 w-16 rounded-2xl border border-white/30 bg-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-2xl font-semibold">
                      {(job.company ?? "C").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wide text-white/80">
                      {job.postedRelative}
                    </div>
                    <h1 className="text-3xl font-semibold leading-tight">
                      {job.title}
                    </h1>
                    <p className="text-sm font-medium text-white/80">
                      {job.company} · {job.location}
                    </p>
                    {job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="divide-y divide-slate-100">
            <div className="grid gap-6 px-8 py-10 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  About this role
                </h2>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="h-4 w-full animate-pulse rounded-full bg-slate-200/70"
                      />
                    ))}
                  </div>
                ) : descriptionParagraphs.length > 0 ? (
                  <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {error
                      ? ""
                      : "The employer hasn't added a detailed description for this role yet."}
                  </p>
                )}
              </div>

              <aside className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                <h3 className="text-sm font-semibold text-slate-700">
                  Role snapshot
                </h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Salary</dt>
                    <dd className="font-medium text-slate-900">
                      {loading ? (
                        <span className="inline-block h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
                      ) : job ? (
                        job.salaryRange
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Work type</dt>
                    <dd className="font-medium text-slate-900">
                      {loading ? (
                        <span className="inline-block h-4 w-20 animate-pulse rounded-full bg-slate-200/70" />
                      ) : job?.workType ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Job type</dt>
                    <dd className="font-medium text-slate-900">
                      {loading ? (
                        <span className="inline-block h-4 w-20 animate-pulse rounded-full bg-slate-200/70" />
                      ) : job?.jobType ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="font-medium text-slate-900">
                      {loading ? (
                        <span className="inline-block h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
                      ) : job?.experienceLevel ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Industry</dt>
                    <dd className="font-medium text-slate-900">
                      {loading ? (
                        <span className="inline-block h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
                      ) : job?.industry ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Posted</dt>
                    <dd className="font-medium text-slate-900">
                      {loading ? (
                        <span className="inline-block h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
                      ) : job?.postedRelative ?? "—"}
                    </dd>
                  </div>
                </dl>
                <div className="space-y-3 pt-2">
                  {applicationSuccess && (
                    <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                      ✓ Application submitted successfully!
                    </div>
                  )}
                  {loading ? (
                    <Button Name="Loading…" width="w-full" />
                  ) : hasApplied ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-slate-300 px-4 py-3 text-sm font-medium text-slate-600 cursor-not-allowed"
                    >
                      Already Applied
                    </button>
                  ) : checkingApplication ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-slate-200 px-4 py-3 text-sm font-medium text-slate-600"
                    >
                      Checking...
                    </button>
                  ) : user?.role === "jobseeker" ? (
                    <button
                      onClick={handleApplyClick}
                      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg"
                    >
                      Apply now
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyClick}
                      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg"
                    >
                      {user ? "Login as Job Seeker" : "Login to Apply"}
                    </button>
                  )}
                </div>
              </aside>
            </div>

            {!loading && !error && !job && (
              <div className="px-8 py-12 text-center text-sm text-slate-500">
                This job is no longer accepting applications.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {job && (
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={handleCloseModal}
          job={job}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}

export default JobView;
