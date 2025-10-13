import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ApplicantManagement from "../components/ApplicantManagement";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const JOBS_ENDPOINT = `${API_BASE_URL}/job`;
const EMPLOYER_PROFILE_ENDPOINT = `${API_BASE_URL}/user/employer/details`;

const STATUS_LABELS = {
  approved: "Approved",
  pending: "Pending review",
  rejected: "Rejected",
  closed: "Closed",
};

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: STATUS_LABELS.approved, value: "approved" },
  { label: STATUS_LABELS.pending, value: "pending" },
  { label: STATUS_LABELS.rejected, value: "rejected" },
  { label: STATUS_LABELS.closed, value: "closed" },
];

const toTitleCase = (value) => {
  if (!value) return null;
  return value
    .toString()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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

const normaliseJobFromApi = (job = {}) => {
  const rawId =
    job.job_id ?? job.id ?? job.jobId ?? job.ID ?? job.uuid ?? job.slug ?? null;
  const statusRaw = (job.status || "pending").toString().toLowerCase();
  const views = Number(job.views ?? job.view_count ?? job.total_views ?? 0);
  const applicants = Number(
    job.applicants ?? job.applicant_count ?? job.total_applicants ?? 0
  );
  const conversionRate =
    views > 0 && applicants > 0
      ? `${Math.round((applicants / views) * 100)}%`
      : "—";
  const conversionValue = views > 0 ? applicants / views : 0;

  const workType = job.work_type ?? job.workType;
  const jobType = job.job_type ?? job.jobType;
  const industry = job.industry ?? job.department;

  const tags = [workType, jobType, industry]
    .map((tag) => toTitleCase(tag))
    .filter(Boolean);

  const createdAt =
    job.created_at ?? job.createdAt ?? job.posted_at ?? job.date_created;

  // Use actual job_id if available, otherwise create slug-based id
  const displayId = rawId ?? `${(job.title || "job").toString().toLowerCase().replace(/\s+/g, "-")}-${
    job.created_at || job.createdAt || Date.now()
  }`;

  console.log("📋 Normalizing job:", job.title, "| job_id:", rawId, "| id:", displayId);

  return {
    id: displayId,
    jobId: rawId, // Actual numeric job_id for backend API calls
    title: job.title ?? "Untitled role",
    location: job.location ?? job.city ?? "Location unspecified",
    status: statusRaw,
    statusLabel: STATUS_LABELS[statusRaw] ?? toTitleCase(statusRaw),
    views,
    applicants,
    conversionRate,
    conversionValue,
    tags,
    postedRelative: formatRelativeTime(createdAt),
    createdAt,
    raw: job,
  };
};

function StatCard({ icon, label, value, trend, trendLabel }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 text-xl text-purple-600">
          {icon}
        </div>
      </div>
      {trend && (
        <p className="mt-4 text-xs font-medium text-emerald-600">
          {trend} ↗ {trendLabel}
        </p>
      )}
    </div>
  );
}

function EmptyState({ onCreate, ctaLabel = "Create a job", disabled = false }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
        <span className="text-2xl">🧑‍💼</span>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900">
        No job posts yet
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Create your first job post to attract top talent. You can track views,
        applications, and manage updates all from here.
      </p>
      <button
        onClick={onCreate}
        disabled={disabled}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{ctaLabel}</span>
      </button>
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, jobTitle }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Delete job post
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <strong>{jobTitle}</strong>? This
          action cannot be undone and will remove all analytics for this post.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
          >
            Delete post
          </button>
        </div>
      </div>
    </div>
  );
}

function JobRow({ job, onEdit, onDelete, onPreview, onCopy, onViewApplicants }) {
  const statusColor =
    {
      approved: "bg-emerald-50 text-emerald-600",
      pending: "bg-amber-50 text-amber-600",
      rejected: "bg-rose-50 text-rose-600",
      closed: "bg-slate-200 text-slate-600",
    }[job.status] ?? "bg-purple-50 text-purple-600";

  const statusDotColor =
    {
      approved: "bg-emerald-500",
      pending: "bg-amber-500",
      rejected: "bg-rose-500",
      closed: "bg-slate-400",
    }[job.status] ?? "bg-purple-500";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg md:flex-row md:items-center">
      <div className="md:flex-1">
        <div className="flex items-start justify-between md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500">{job.location}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${statusColor}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusDotColor}`} />
                {job.statusLabel ?? toTitleCase(job.status ?? "pending")}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Posted {job.postedRelative ?? "recently"}
              </span>
            </div>
          </div>
          <button
            onClick={() => onCopy(job)}
            className="hidden h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 md:inline-flex"
          >
            Copy link
          </button>
        </div>

        {job.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 md:w-64">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-500">
          <div>
            <p className="text-slate-400">Views</p>
            <p className="mt-1 text-base text-slate-900">{job.views ?? 0}</p>
          </div>
          <div>
            <p className="text-slate-400">Applicants</p>
            <p className="mt-1 text-base text-slate-900">
              {job.applicants ?? 0}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Conversion</p>
            <p className="mt-1 text-base text-slate-900">
              {job.conversionRate ?? "--"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onViewApplicants(job)}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-orange-600"
          >
            View Applicants ({job.applicants ?? 0})
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => onPreview(job)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Preview
          </button>
          <button
            onClick={() => onEdit(job)}
            className="flex-1 rounded-xl bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(job)}
            className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployerDashboard() {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isEmployer,
    isAdmin,
  } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processingDelete, setProcessingDelete] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState("jobs");
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

  const canManageJobs = useMemo(() => {
    if (!isAuthenticated) return false;
    const employerAllowed =
      typeof isEmployer === "function" ? isEmployer() : false;
    const adminAllowed = typeof isAdmin === "function" ? isAdmin() : false;
    return employerAllowed || adminAllowed;
  }, [isAuthenticated, isEmployer, isAdmin]);

  useEffect(() => {
    if (!authLoading && !canManageJobs) {
      navigate("/register", { replace: true });
    }
  }, [authLoading, canManageJobs, navigate]);

  const fetchJobs = useCallback(async () => {
    setFetching(true);
    setError(null);

    try {
      const response = await axios.get(`${JOBS_ENDPOINT}/my-jobs`);
      const jobsPayload = Array.isArray(response.data)
        ? response.data
        : response.data?.jobs ?? [];
      setJobs(jobsPayload.map((job) => normaliseJobFromApi(job)));
    } catch (err) {
      setJobs([]);
      setError(
        err.response?.data?.error ||
          "We couldn't load your job posts right now. Please try again shortly."
      );
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await axios.get(EMPLOYER_PROFILE_ENDPOINT);
      setProfile(response.data ?? null);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setProfileError(
          err.response?.data?.error ||
            "We couldn't load your employer profile. Please try again shortly."
        );
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && canManageJobs) {
      fetchProfile();
      fetchJobs();
    }
  }, [authLoading, canManageJobs, fetchProfile, fetchJobs]);

  const handleCreateJob = useCallback(() => {
    if (!profile && !profileLoading) {
      navigate("/employer/profile");
      return;
    }
    navigate("/post-job");
  }, [navigate, profile, profileLoading]);

  const handleEditJob = useCallback(
    (job) => {
      if (!job?.id) return;
      navigate("/post-job", { state: { jobId: job.id, job: job.raw ?? job } });
    },
    [navigate]
  );

  const handlePreviewJob = useCallback(
    (job) => {
      if (!job?.id) return;
      navigate("/job", { state: { jobId: job.id, job: job.raw ?? job } });
    },
    [navigate]
  );

  const handleCopyLink = useCallback(async (job) => {
    if (!job?.id) return;
    const link = `${window.location.origin}/job?jobId=${job.id}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Silently fail; clipboard might be unavailable
    }
  }, []);

  const requestDeleteJob = useCallback((job) => {
    setDeleteTarget(job);
  }, []);

  const handleDeleteJob = useCallback(async () => {
    if (!deleteTarget?.id) return;
    setProcessingDelete(true);

    try {
      await axios.delete(`${JOBS_ENDPOINT}/${deleteTarget.id}`);
      setJobs((prev) => prev.filter((job) => job.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to delete job post. Please try again or contact support."
      );
    } finally {
      setProcessingDelete(false);
    }
  }, [deleteTarget]);

  const handleViewApplicants = useCallback((job) => {
    console.log("👀 View Applicants clicked for job:", job);
    console.log("  - job.id:", job.id);
    console.log("  - job.jobId:", job.jobId);
    console.log("  - job.job_id:", job.job_id);
    setSelectedJobForApplicants(job);
    setActiveTab("applicants");
  }, []);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch = term
        ? job.title?.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term)
        : true;
      const matchesStatus =
        statusFilter === "all" || (job.status || "pending") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const dashboardStats = useMemo(() => {
    if (!jobs.length) {
      return {
        totalJobs: 0,
        totalViews: 0,
        totalApplicants: 0,
        averageViews: "0",
      };
    }

    const totals = jobs.reduce(
      (acc, job) => {
        acc.views += Number(job.views || 0);
        acc.applicants += Number(job.applicants || 0);
        return acc;
      },
      { views: 0, applicants: 0 }
    );

    return {
      totalJobs: jobs.length,
      totalViews: totals.views,
      totalApplicants: totals.applicants,
      averageViews: Math.round(totals.views / jobs.length || 0).toString(),
    };
  }, [jobs]);

  const missingProfile = !profileLoading && !profile;

  const { topViewedJob, topConversionJob } = useMemo(() => {
    if (!jobs.length) {
      return { topViewedJob: null, topConversionJob: null };
    }

    const byViews = [...jobs].sort(
      (a, b) => Number(b.views ?? 0) - Number(a.views ?? 0)
    );

    const byConversion = [...jobs]
      .filter((job) => job.conversionValue > 0)
      .sort((a, b) => b.conversionValue - a.conversionValue);

    return {
      topViewedJob: byViews[0] ?? null,
      topConversionJob:
        byConversion[0] ??
        (byViews.length > 1 ? byViews[1] : byViews[0]) ??
        null,
    };
  }, [jobs]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 lg:px-0">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-purple-600 to-orange-500 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/80">
                Employer Control Center
              </p>
              <h1 className="mt-1 text-3xl font-semibold">
                {user?.name
                  ? `Welcome back, ${user.name}`
                  : "Manage your job posts"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/80">
                Monitor performance, keep listings fresh, and stay ahead of
                applicants. Everything you need to manage your hiring strategy
                in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchJobs}
                disabled={fetching}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh data
              </button>
              <button
                onClick={handleCreateJob}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-purple-600 shadow-md transition-all hover:shadow-lg"
              >
                {missingProfile ? "Complete profile" : "+ New job post"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="📃"
              label="Active Job Posts"
              value={dashboardStats.totalJobs}
            />
            <StatCard
              icon="👀"
              label="Total Views"
              value={dashboardStats.totalViews}
            />
            <StatCard
              icon="🧑‍💼"
              label="Applicants"
              value={dashboardStats.totalApplicants}
            />
            <StatCard
              icon="📊"
              label="Avg. Views per Job"
              value={dashboardStats.averageViews}
            />
          </div>
        </header>

        {profileError && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {profileError}
          </div>
        )}

        {missingProfile && !profileError && (
          <div className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            <div>
              <h2 className="text-lg font-semibold">
                Complete your employer profile
              </h2>
              <p className="text-sm">
                Add your company details to unlock job posting tools and help
                candidates learn about your organisation.
              </p>
            </div>
            <div>
              <button
                onClick={() => navigate("/employer/profile")}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
              >
                Complete profile
              </button>
            </div>
          </div>
        )}

        {profile && (
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={`${profile.company_name || "Company"} logo`}
                    className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
                    🏢
                  </div>
                )}
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {profile.company_name || "Your company"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {profile.company_address || "Address not specified"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    {profile.industry && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                        {toTitleCase(profile.industry)}
                      </span>
                    )}
                    {profile.contact_number && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                        {profile.contact_number}
                      </span>
                    )}
                    {profile.email && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                        {profile.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                {profile.company_website && (
                  <a
                    href={profile.company_website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:underline"
                  >
                    Visit website
                  </a>
                )}
                <button
                  onClick={() => navigate("/employer/profile")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Update profile
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === "jobs"
                ? "text-purple-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Jobs
            {activeTab === "jobs" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-orange-500"></span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("applicants");
              if (!selectedJobForApplicants && jobs.length > 0) {
                setSelectedJobForApplicants(jobs[0]);
              }
            }}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === "applicants"
                ? "text-purple-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Applicants
            {activeTab === "applicants" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-orange-500"></span>
            )}
          </button>
        </div>

        {/* Jobs Tab Content */}
        {activeTab === "jobs" && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Job posts overview
                </h2>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                      />
                    </svg>
                  </span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title or location"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                        statusFilter === filter.value
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {fetching ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredJobs.length ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onEdit={handleEditJob}
                    onDelete={requestDeleteJob}
                    onPreview={handlePreviewJob}
                    onCopy={handleCopyLink}
                    onViewApplicants={handleViewApplicants}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                onCreate={handleCreateJob}
                disabled={missingProfile}
                ctaLabel={missingProfile ? "Complete profile" : "Create a job"}
              />
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Weekly performance snapshot
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Track how your listings are performing over the past week.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Top job by views
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {topViewedJob?.title ?? "No data yet"}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-purple-600">
                    {topViewedJob?.views ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Highest conversion
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {topConversionJob?.title ?? "No data yet"}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {topConversionJob?.conversionRate ?? "0%"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Hiring checklist
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-600">
                    1
                  </span>
                  Review pending applications and shortlist top candidates.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-600">
                    2
                  </span>
                  Refresh older listings or archive roles you've filled.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-600">
                    3
                  </span>
                  Update job descriptions with the latest role expectations.
                </li>
              </ul>
            </div>
          </div>
        </section>
        )}

        {/* Applicants Tab Content */}
        {activeTab === "applicants" && (
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            {selectedJobForApplicants ? (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                    Back to Jobs
                  </button>
                  <select
                    value={selectedJobForApplicants.id}
                    onChange={(e) => {
                      const job = jobs.find((j) => j.id === e.target.value);
                      if (job) setSelectedJobForApplicants(job);
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.applicants || 0} applicants)
                      </option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const jobId = selectedJobForApplicants.jobId || selectedJobForApplicants.id;
                  console.log("🔍 Passing to ApplicantManagement:");
                  console.log("  - jobId:", jobId);
                  console.log("  - selectedJobForApplicants:", selectedJobForApplicants);
                  return (
                    <ApplicantManagement
                      jobId={jobId}
                      jobTitle={selectedJobForApplicants.title}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-4xl">📋</div>
                <h3 className="text-lg font-semibold text-slate-900">
                  No job selected
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Create a job post first to view applicants.
                </p>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-orange-600"
                >
                  Go to Jobs
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => (processingDelete ? null : setDeleteTarget(null))}
        onConfirm={processingDelete ? undefined : handleDeleteJob}
        jobTitle={deleteTarget?.title}
      />
    </div>
  );
}

export default EmployerDashboard;
