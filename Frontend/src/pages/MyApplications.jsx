import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  reviewed: "bg-blue-100 text-blue-800 border-blue-300",
  shortlisted: "bg-purple-100 text-purple-800 border-purple-300",
  interviewed: "bg-indigo-100 text-indigo-800 border-indigo-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

const statusIcons = {
  pending: "⏳",
  reviewed: "👁️",
  shortlisted: "⭐",
  interviewed: "🎯",
  rejected: "❌",
};

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/register-login");
        return;
      }

      const { data } = await axios.get(`${API_BASE_URL}/job/my/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(data.applications || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== "jobseeker") {
      navigate("/");
      return;
    }

    fetchApplications();
  }, [user, navigate, fetchApplications]);

  const handleViewJob = (jobId) => {
    navigate(`/job-view?jobId=${jobId}`);
  };

  const handleDownloadResume = (resumeUrl) => {
    window.open(resumeUrl, "_blank");
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  const statistics = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    reviewed: applications.filter((app) => app.status === "reviewed").length,
    shortlisted: applications.filter((app) => app.status === "shortlisted")
      .length,
    interviewed: applications.filter((app) => app.status === "interviewed")
      .length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16 pt-10">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track the status of your job applications
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {statistics.total}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 text-2xl">📋</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">
                  {statistics.pending}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-100 p-3 text-2xl">⏳</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Shortlisted</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {statistics.shortlisted}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3 text-2xl">⭐</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Interviewed</p>
                <p className="mt-1 text-2xl font-bold text-indigo-600">
                  {statistics.interviewed}
                </p>
              </div>
              <div className="rounded-lg bg-indigo-100 p-3 text-2xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
            { value: "shortlisted", label: "Shortlisted" },
            { value: "interviewed", label: "Interviewed" },
            { value: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-purple-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              📄
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No applications found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {filter === "all"
                ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                : `No ${filter} applications found.`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/all-jobs")}
                className="mt-6 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.application_id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left Section - Job Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      {app.company_logo ? (
                        <img
                          src={app.company_logo}
                          alt={app.company_name}
                          className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-600">
                          {app.company_name?.charAt(0) || "C"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3
                          onClick={() => handleViewJob(app.job_id)}
                          className="cursor-pointer text-lg font-semibold text-slate-900 hover:text-purple-600"
                        >
                          {app.job_title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <FaBriefcase className="h-3.5 w-3.5" />
                            {app.company_name}
                          </span>
                          {app.location && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="h-3.5 w-3.5" />
                              {app.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {app.cover_letter && (
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-700">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {app.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="h-3 w-3" />
                        Applied: {formatDate(app.applied_at)}
                      </span>
                      {app.resume_url && (
                        <button
                          onClick={() => handleDownloadResume(app.resume_url)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                        >
                          <FaFileAlt className="h-3 w-3" />
                          View Resume
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Status */}
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                        statusColors[app.status] || statusColors.pending
                      }`}
                    >
                      <span className="text-base">
                        {statusIcons[app.status] || statusIcons.pending}
                      </span>
                      {app.status?.charAt(0).toUpperCase() +
                        app.status?.slice(1) || "Pending"}
                    </span>

                    <button
                      onClick={() => handleViewJob(app.job_id)}
                      className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      View Job
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
