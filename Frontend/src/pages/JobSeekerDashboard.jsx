import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaBriefcase,
  FaBookmark,
  FaCog,
  FaEdit,
  FaCamera,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaCalendarAlt,
  FaFileAlt,
  FaChartLine,
  FaCheckCircle,
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

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Applications state
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
  // Saved jobs state
  const [savedJobs, setSavedJobs] = useState([]);
  const [_savedJobsLoading, setSavedJobsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    contact_number: "",
    birthday: "",
    gender: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user is job seeker
  useEffect(() => {
    if (!user || user.role !== "jobseeker") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${API_BASE_URL}/user/jobseeker/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        address: data.address || "",
        contact_number: data.contact_number || "",
        birthday: data.birthday ? data.birthday.split("T")[0] : "",
        gender: data.gender || "",
      });
      if (data.profile_picture) {
        setProfilePicturePreview(data.profile_picture);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status !== 404) {
        setError("Failed to load profile");
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${API_BASE_URL}/job/my/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns array directly, not wrapped in object
      setApplications(Array.isArray(data) ? data : []);
      console.log("✅ Applications fetched:", data);
    } catch (err) {
      console.error("❌ Error fetching applications:", err);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    try {
      setSavedJobsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/job/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
      console.log("✅ Saved jobs fetched:", response.data.jobs?.length || 0);
    } catch (err) {
      console.error("❌ Error fetching saved jobs:", err);
      setSavedJobs([]);
    } finally {
      setSavedJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchSavedJobs();
  }, [fetchProfile, fetchApplications, fetchSavedJobs]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.full_name.trim() || !formData.birthday || !formData.gender) {
      setError("Full name, birthday, and gender are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("full_name", formData.full_name.trim());
      data.append("address", formData.address.trim());
      data.append("contact_number", formData.contact_number.trim());
      data.append("birthday", formData.birthday);
      data.append("gender", formData.gender);

      if (profilePicture) {
        data.append("profile_picture", profilePicture);
      }

      await axios.patch(`${API_BASE_URL}/user/jobseeker/details`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
      fetchProfile();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPG or PNG image");
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("Image size must be less than 2MB");
        return;
      }

      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status?.toLowerCase() === "pending").length,
    shortlisted: applications.filter(app => app.status?.toLowerCase() === "shortlisted").length,
    interviewed: applications.filter(app => app.status?.toLowerCase() === "interviewed").length,
    savedJobs: savedJobs.length,
    profileCompletion: profile ? 
      (profile.full_name ? 25 : 0) +
      (profile.contact_number ? 20 : 0) +
      (profile.address ? 15 : 0) +
      (profile.birthday ? 20 : 0) +
      (profile.profile_picture ? 20 : 0) : 0,
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, {profile?.full_name || user?.name || "Job Seeker"}!
            </p>
          </div>
          <button
            onClick={() => navigate("/all-jobs")}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg"
          >
            Browse Jobs
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Applications</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.totalApplications}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <FaBriefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Shortlisted</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {stats.shortlisted}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <FaCheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Saved Jobs</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {stats.savedJobs}
                </p>
              </div>
              <div className="rounded-lg bg-orange-100 p-3">
                <FaBookmark className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Profile Complete</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {stats.profileCompletion}%
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <FaChartLine className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
          {[
            { id: "overview", label: "Overview", icon: FaChartLine },
            { id: "profile", label: "My Profile", icon: FaUser },
            { id: "applications", label: "Applications", icon: FaBriefcase },
            { id: "saved", label: "Saved Jobs", icon: FaBookmark },
            { id: "settings", label: "Settings", icon: FaCog },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Dashboard Overview</h2>
              
              {/* Profile Completion Alert */}
              {stats.profileCompletion < 100 && (
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <FaUser className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">
                        Complete Your Profile ({stats.profileCompletion}%)
                      </h3>
                      <p className="mt-1 text-sm text-orange-800">
                        A complete profile helps employers know more about you and increases your chances of getting hired.
                      </p>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                      >
                        Complete Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Applications */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Applications
                  </h3>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    View All →
                  </button>
                </div>
                {applications.length === 0 ? (
                  <div className="rounded-lg bg-slate-50 p-8 text-center">
                    <FaBriefcase className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-3 text-sm text-slate-600">
                      You haven't applied to any jobs yet.
                    </p>
                    <button
                      onClick={() => navigate("/all-jobs")}
                      className="mt-4 rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Browse Jobs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app) => (
                      <div
                        key={app.application_id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-3">
                          {app.company_logo ? (
                            <img
                              src={app.company_logo}
                              alt={app.company_name}
                              className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                              {app.company_name?.charAt(0) || "C"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-slate-900">{app.job_title}</h4>
                            <p className="text-sm text-slate-600">{app.company_name}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            statusColors[app.status?.toLowerCase()] || statusColors.pending
                          }`}
                        >
                          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">My Profile</h2>
                {!isEditingProfile && profile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FaEdit className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {!profile ? (
                <div className="rounded-lg bg-orange-50 p-8 text-center">
                  <FaUser className="mx-auto h-16 w-16 text-orange-400" />
                  <h3 className="mt-4 text-lg font-semibold text-orange-900">
                    Create Your Profile
                  </h3>
                  <p className="mt-2 text-sm text-orange-800">
                    You need to create your profile before applying for jobs.
                  </p>
                  <button
                    onClick={() => navigate("/jobseeker/profile")}
                    className="mt-4 rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white hover:bg-orange-700"
                  >
                    Create Profile
                  </button>
                </div>
              ) : isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <div className="relative mx-auto mb-4 h-32 w-32">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="h-32 w-32 rounded-full border-4 border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-slate-300 bg-slate-50">
                          <FaCamera className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <label
                        htmlFor="profilePicture"
                        className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-700"
                      >
                        <FaCamera className="h-4 w-4" />
                        <input
                          id="profilePicture"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_number}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_number: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Birthday <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.birthday}
                        onChange={(e) =>
                          setFormData({ ...formData, birthday: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Address
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        fetchProfile();
                      }}
                      className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-2 text-sm font-medium text-white hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Display */}
                  <div className="flex items-start gap-6">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt="Profile"
                        className="h-24 w-24 rounded-full border-4 border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-200 bg-slate-100 text-2xl font-bold text-slate-500">
                        {profile.full_name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {profile.full_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">Job Seeker</p>
                    </div>
                  </div>

                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <FaPhone className="mt-1 h-5 w-5 text-slate-400" />
                      <div>
                        <dt className="text-sm font-medium text-slate-600">Contact</dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {profile.contact_number || "Not provided"}
                        </dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaBirthdayCake className="mt-1 h-5 w-5 text-slate-400" />
                      <div>
                        <dt className="text-sm font-medium text-slate-600">Birthday</dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {formatDate(profile.birthday)}
                        </dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaUser className="mt-1 h-5 w-5 text-slate-400" />
                      <div>
                        <dt className="text-sm font-medium text-slate-600">Gender</dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {profile.gender}
                        </dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="mt-1 h-5 w-5 text-slate-400" />
                      <div>
                        <dt className="text-sm font-medium text-slate-600">Address</dt>
                        <dd className="mt-1 text-sm text-slate-900">
                          {profile.address || "Not provided"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">My Applications</h2>
              
              {applicationsLoading ? (
                <div className="text-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-12 text-center">
                  <FaBriefcase className="mx-auto h-16 w-16 text-slate-400" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No Applications Yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Start applying to jobs to track your applications here.
                  </p>
                  <button
                    onClick={() => navigate("/all-jobs")}
                    className="mt-6 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-sm font-medium text-white hover:shadow-lg"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.application_id}
                      className="rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                              onClick={() => navigate(`/job-view?jobId=${app.job_id}`)}
                              className="cursor-pointer text-lg font-semibold text-slate-900 hover:text-purple-600"
                            >
                              {app.job_title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {app.company_name} · {app.location}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="h-3 w-3" />
                                Applied: {formatDate(app.applied_at)}
                              </span>
                              {app.resume_url && (
                                <a
                                  href={app.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                                >
                                  <FaFileAlt className="h-3 w-3" />
                                  View Resume
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${
                            statusColors[app.status?.toLowerCase()] || statusColors.pending
                          }`}
                        >
                          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Jobs Tab */}
          {activeTab === "saved" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Saved Jobs</h2>
                <button
                  onClick={fetchSavedJobs}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
              
              {savedJobs.length === 0 ? (
                <div className="rounded-lg bg-blue-50 p-8 text-center">
                  <FaBookmark className="mx-auto h-16 w-16 text-blue-400" />
                  <h3 className="mt-4 text-lg font-semibold text-blue-900">
                    No Saved Jobs Yet
                  </h3>
                  <p className="mt-2 text-sm text-blue-800">
                    Browse jobs and click the bookmark icon to save them for later.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{job.title}</h3>
                          <p className="text-sm text-slate-600">{job.location}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {job.tags?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              await axios.delete(`${API_BASE_URL}/job/${job.id}/save`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              fetchSavedJobs();
                            } catch (err) {
                              console.error("Error removing saved job:", err);
                            }
                          }}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <FaBookmark className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => navigate(`/job-view?jobId=${job.id}`)}
                          className="flex-1 rounded-lg border border-purple-600 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Account Settings</h2>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">Email Notifications</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage your email notification preferences
                  </p>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-purple-600" />
                      <span className="text-sm text-slate-700">Job application updates</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-purple-600" />
                      <span className="text-sm text-slate-700">New job recommendations</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-purple-600" />
                      <span className="text-sm text-slate-700">Weekly newsletter</span>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="font-semibold text-red-900">Danger Zone</h3>
                  <p className="mt-1 text-sm text-red-800">
                    Permanently delete your account and all associated data
                  </p>
                  <button className="mt-4 rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
