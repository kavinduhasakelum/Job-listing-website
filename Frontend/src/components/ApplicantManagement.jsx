import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaFileDownload, FaFilter, FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "yellow", icon: FaClock },
  { value: "reviewed", label: "Reviewed", color: "blue", icon: FaCheckCircle },
  { value: "shortlisted", label: "Shortlisted", color: "green", icon: FaCheckCircle },
  { value: "rejected", label: "Rejected", color: "red", icon: FaTimesCircle },
  { value: "interviewed", label: "Interviewed", color: "purple", icon: FaCheckCircle },
];

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function ApplicantCard({ applicant, onStatusChange, onDownloadResume }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(applicant.status || "pending");

  const currentStatus = STATUS_OPTIONS.find(s => s.value === selectedStatus);
  const StatusIcon = currentStatus?.icon || FaClock;

  const statusColors = {
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    setSelectedStatus(newStatus);
    await onStatusChange(applicant.application_id, newStatus);
    setIsUpdating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center text-purple-600 font-semibold text-lg">
            {applicant.jobseeker_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{applicant.jobseeker_name || "Unknown"}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <FaEnvelope className="text-xs" />
              {applicant.email || "No email"}
            </p>
            {applicant.phone && (
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <FaPhone className="text-xs" />
                {applicant.phone}
              </p>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusColors[currentStatus?.color || "yellow"]}`}>
          <StatusIcon className="text-xs" />
          {currentStatus?.label || "Pending"}
        </div>
      </div>

      {applicant.cover_letter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-600 mb-1">Cover Letter</p>
          <p className="text-sm text-slate-700 line-clamp-3">{applicant.cover_letter}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Applied: {formatDate(applicant.applied_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          {applicant.resume_url && (
            <button
              onClick={() => onDownloadResume(applicant.resume_url)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <FaFileDownload />
              Resume
            </button>
          )}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function ApplicantManagement({ jobId, jobTitle }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  console.log("📊 ApplicantManagement mounted");
  console.log("  - Job ID:", jobId, "| Type:", typeof jobId);
  console.log("  - Job Title:", jobTitle);
  console.log("  - API_BASE_URL:", API_BASE_URL);

  const fetchApplicants = React.useCallback(async () => {
    if (!jobId) {
      console.error("❌ No jobId provided to ApplicantManagement");
      setError("Invalid job ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE_URL}/job/applicants/${jobId}`;
      console.log("🔍 Fetching applicants:");
      console.log("  - API_BASE_URL:", API_BASE_URL);
      console.log("  - Job ID:", jobId);
      console.log("  - Constructed URL:", url);
      console.log("  - Token exists:", !!token);
      console.log("  - Token preview:", token ? token.substring(0, 20) + "..." : "none");
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Applicants fetched successfully:", response.data);
      setApplicants(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to fetch applicants";
      setError(errorMsg);
      console.error("❌ Error fetching applicants:");
      console.error("  - Status:", err.response?.status);
      console.error("  - Error message:", errorMsg);
      console.error("  - Job ID used:", jobId);
      console.error("  - Full error:", err.response?.data);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Updating application status:", applicationId, "to", newStatus);
      await axios.put(
        `${API_BASE_URL}/job/${jobId}/applicants/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.application_id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      console.log("✅ Status updated successfully");
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDownloadResume = (resumeUrl) => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      !searchTerm ||
      applicant.jobseeker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    reviewed: applicants.filter((a) => a.status === "reviewed").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
    interviewed: applicants.filter((a) => a.status === "interviewed").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchApplicants}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Applicants for: {jobTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {filteredApplicants.length} of {applicants.length} applicants
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-xs font-medium text-yellow-700 uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs font-medium text-blue-700 uppercase">Reviewed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.reviewed}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-xs font-medium text-green-700 uppercase">Shortlisted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <p className="text-xs font-medium text-purple-700 uppercase">Interviewed</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.interviewed}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-xs font-medium text-red-700 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <FaUser className="text-2xl text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No applicants yet</h3>
          <p className="text-sm text-slate-500">
            {searchTerm || statusFilter !== "all"
              ? "No applicants match your filters. Try adjusting your search."
              : "Applicants will appear here once they apply to this job."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.application_id}
              applicant={applicant}
              onStatusChange={handleStatusChange}
              onDownloadResume={handleDownloadResume}
            />
          ))}
        </div>
      )}
    </div>
  );
}
