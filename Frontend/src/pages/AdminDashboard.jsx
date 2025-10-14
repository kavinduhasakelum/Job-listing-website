import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaCog,
  FaSignOutAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Sidebar
function Sidebar({ open, setOpen, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menus = [
    { title: "Dashboard", icon: <FaHome />, key: "dashboard" },
    { title: "All Jobs", icon: <FaBriefcase />, key: "all-jobs" },
    { title: "Pending Jobs", icon: <FaClock />, key: "pending-jobs" },
    { title: "User Management", icon: <FaUsers />, key: "users" },
    { title: "Settings", icon: <FaCog />, key: "settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-gradient-to-b from-indigo-700 to-orange-500 text-white h-screen p-4 fixed transition-all duration-300 shadow-lg z-50`}
    >
      <div className="flex justify-between items-center mb-10">
        <h1 className={`text-2xl font-bold tracking-wide ${!open && "hidden"}`}>
          <span className="text-white">Work</span>
          <span className="text-orange-300">Nest</span>
        </h1>

        <button
          onClick={() => setOpen(!open)}
          className="text-white text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      <ul className="space-y-4">
        {menus.map((menu, i) => (
          <li
            key={i}
            onClick={() => setActiveTab(menu.key)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
              activeTab === menu.key
                ? "bg-white/30"
                : "hover:bg-white/20"
            }`}
          >
            <span className="text-lg">{menu.icon}</span>
            <span className={`${!open && "hidden"} text-sm font-medium`}>
              {menu.title}
            </span>
          </li>
        ))}
        <li
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/30 cursor-pointer transition"
        >
          <span className="text-lg"><FaSignOutAlt /></span>
          <span className={`${!open && "hidden"} text-sm font-medium`}>
            Logout
          </span>
        </li>
      </ul>
    </div>
  );
}

// Topbar
function Topbar({ searchTerm, setSearchTerm }) {
  const { user } = useAuth();

  return (
    <div className="w-full flex justify-between items-center bg-white shadow px-6 py-3">
      <h2 className="font-semibold text-lg text-indigo-700">Admin Dashboard</h2>
      <div className="relative w-1/3">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{user?.userName || "Admin"}</span>
        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
          {user?.userName?.[0]?.toUpperCase() || "A"}
        </div>
      </div>
    </div>
  );
}

// Card Component
function Card({ title, value, icon, color = "from-indigo-600 to-orange-500" }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow hover:scale-[1.02] transition`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{value}</h2>
          <p className="text-sm text-white/90">{title}</p>
        </div>
        <div className="text-3xl opacity-90">{icon}</div>
      </div>
    </div>
  );
}

// Job Approval Modal
function JobApprovalModal({ job, onClose, onApprove, onReject }) {
  const [action, setAction] = useState("approve");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (action === "approve") {
      await onApprove(job.job_id);
    } else {
      await onReject(job.job_id, reason);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Review Job: {job.title}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600"><strong>Company:</strong> {job.company_name || "N/A"}</p>
          <p className="text-sm text-gray-600"><strong>Employer:</strong> {job.employer_name || "N/A"}</p>
          <p className="text-sm text-gray-600"><strong>Location:</strong> {job.location || "N/A"}</p>
          <p className="text-sm text-gray-600"><strong>Type:</strong> {job.job_type || "N/A"}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
          <div className="flex gap-4">
            <button
              onClick={() => setAction("approve")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                action === "approve"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaCheckCircle className="inline mr-2" />
              Approve
            </button>
            <button
              onClick={() => setAction("reject")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                action === "reject"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaTimesCircle className="inline mr-2" />
              Reject
            </button>
          </div>
        </div>

        {action === "reject" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this job is being rejected..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows="4"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (action === "reject" && !reason.trim())}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              action === "approve"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : action === "approve" ? "Approve Job" : "Reject Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview
function DashboardOverview({ stats }) {
  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Jobs" 
          value={stats.jobs?.total_jobs || 0} 
          icon={<FaBriefcase />}
          color="from-blue-500 to-blue-600"
        />
        <Card 
          title="Pending Jobs" 
          value={stats.jobs?.pending_jobs || 0} 
          icon={<FaClock />}
          color="from-yellow-500 to-orange-500"
        />
        <Card 
          title="Total Users" 
          value={stats.users?.total_users || 0} 
          icon={<FaUsers />}
          color="from-purple-500 to-pink-500"
        />
        <Card 
          title="Total Views" 
          value={stats.jobs?.total_views || 0} 
          icon={<FaEye />}
          color="from-green-500 to-teal-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Approved Jobs</span>
              <span className="font-semibold text-green-600">{stats.jobs?.approved_jobs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Jobs</span>
              <span className="font-semibold text-yellow-600">{stats.jobs?.pending_jobs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rejected Jobs</span>
              <span className="font-semibold text-red-600">{stats.jobs?.rejected_jobs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Applicants</span>
              <span className="font-semibold text-indigo-600">{stats.jobs?.total_applicants || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Employers</span>
              <span className="font-semibold text-blue-600">{stats.users?.total_employers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Job Seekers</span>
              <span className="font-semibold text-purple-600">{stats.users?.total_jobseekers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verified Users</span>
              <span className="font-semibold text-green-600">{stats.users?.verified_users || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold text-indigo-600">{stats.users?.active_users || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Approval Rate</span>
              <span className="font-semibold text-green-600">
                {stats.jobs?.total_jobs 
                  ? `${Math.round((stats.jobs.approved_jobs / stats.jobs.total_jobs) * 100)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Views/Job</span>
              <span className="font-semibold text-blue-600">
                {stats.jobs?.total_jobs 
                  ? Math.round(stats.jobs.total_views / stats.jobs.total_jobs)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verification Rate</span>
              <span className="font-semibold text-purple-600">
                {stats.users?.total_users 
                  ? `${Math.round((stats.users.verified_users / stats.users.total_users) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jobs Table
function JobsTable({ jobs, onReview, loading, statusFilter, setStatusFilter }) {
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === statusFilter));
    }
  }, [jobs, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-indigo-700">Job Listings</h2>
        <div className="flex gap-2 items-center">
          <FaFilter className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No jobs found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3">Job Title</th>
                <th className="py-3">Company</th>
                <th className="py-3">Employer</th>
                <th className="py-3">Location</th>
                <th className="py-3">Type</th>
                <th className="py-3">Posted</th>
                <th className="py-3 text-center">Views</th>
                <th className="py-3 text-center">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.job_id} className="border-b hover:bg-indigo-50">
                  <td className="py-3 font-medium">{job.title}</td>
                  <td className="py-3">{job.company_name || "N/A"}</td>
                  <td className="py-3">{job.employer_name || "N/A"}</td>
                  <td className="py-3">{job.location || "N/A"}</td>
                  <td className="py-3">{job.job_type || "N/A"}</td>
                  <td className="py-3">{formatDate(job.created_at)}</td>
                  <td className="py-3 text-center">{job.views || 0}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {job.status === "pending" && (
                      <button
                        onClick={() => onReview(job)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs transition"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// User Management Section
function UserManagement({ users, loading, onDeleteUser }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    if (roleFilter === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === roleFilter));
    }
  }, [users, roleFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-indigo-700">User Management</h2>
        <div className="flex gap-2 items-center">
          <FaFilter className="text-gray-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="employer">Employers</option>
            <option value="jobseeker">Job Seekers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3">Name</th>
                <th className="py-3">Email</th>
                <th className="py-3">Role</th>
                <th className="py-3">Verified</th>
                <th className="py-3">Joined</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-b hover:bg-indigo-50">
                  <td className="py-3 font-medium">{user.userName}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-white text-xs ${
                      user.role === "admin" ? "bg-purple-500" :
                      user.role === "employer" ? "bg-blue-500" :
                      "bg-green-500"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3">
                    {user.is_verified ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </td>
                  <td className="py-3">{formatDate(user.created_at)}</td>
                  <td className="py-3 text-right">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => onDeleteUser(user.user_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Main Admin Dashboard
export default function AdminDashboard() {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ jobs: {}, users: {} });
  const [allJobs, setAllJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { token } = useAuth();

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  // Fetch all jobs
  useEffect(() => {
    const fetchAllJobs = async () => {
      if (activeTab !== "all-jobs") return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/admin/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAllJobs(data);
        }
      } catch (error) {
        console.error("Error fetching all jobs:", error);
      }
      setLoading(false);
    };

    if (token && activeTab === "all-jobs") {
      fetchAllJobs();
    }
  }, [token, activeTab]);

  // Fetch pending jobs
  useEffect(() => {
    const fetchPendingJobs = async () => {
      if (activeTab !== "pending-jobs") return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/admin/jobs/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPendingJobs(data);
        }
      } catch (error) {
        console.error("Error fetching pending jobs:", error);
      }
      setLoading(false);
    };

    if (token && activeTab === "pending-jobs") {
      fetchPendingJobs();
    }
  }, [token, activeTab]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== "users") return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };

    if (token && activeTab === "users") {
      fetchUsers();
    }
  }, [token, activeTab]);

  // Handle job approval
  const handleApproveJob = async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/admin/jobs/approve/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        setPendingJobs(prev => prev.filter(job => job.job_id !== jobId));
        const statsResponse = await fetch(`${API_URL}/admin/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        }
      }
    } catch (error) {
      console.error("Error approving job:", error);
    }
  };

  // Handle job rejection
  const handleRejectJob = async (jobId, reason) => {
    try {
      const response = await fetch(`${API_URL}/admin/jobs/approve/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected", reason }),
      });

      if (response.ok) {
        setPendingJobs(prev => prev.filter(job => job.job_id !== jobId));
        const statsResponse = await fetch(`${API_URL}/admin/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        }
      }
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/soft/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.user_id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Filter jobs by search term
  const filteredJobsForDisplay = (jobs) => {
    if (!searchTerm) return jobs;
    return jobs.filter(
      job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar open={open} setOpen={setOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div
        className={`flex-1 transition-all duration-300 ${
          open ? "ml-64" : "ml-20"
        }`}
      >
        <Topbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="p-6">
          {activeTab === "dashboard" && <DashboardOverview stats={stats} />}
          
          {activeTab === "all-jobs" && (
            <JobsTable
              jobs={filteredJobsForDisplay(allJobs)}
              onReview={(job) => setSelectedJob(job)}
              loading={loading}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
          
          {activeTab === "pending-jobs" && (
            <JobsTable
              jobs={filteredJobsForDisplay(pendingJobs)}
              onReview={(job) => setSelectedJob(job)}
              loading={loading}
              statusFilter="pending"
              setStatusFilter={() => {}}
            />
          )}
          
          {activeTab === "users" && (
            <UserManagement
              users={users}
              loading={loading}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-lg font-semibold text-indigo-700 mb-4">Settings</h2>
              <p className="text-gray-600">Settings functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Approval Modal */}
      {selectedJob && (
        <JobApprovalModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApprove={handleApproveJob}
          onReject={handleRejectJob}
        />
      )}
    </div>
  );
}
