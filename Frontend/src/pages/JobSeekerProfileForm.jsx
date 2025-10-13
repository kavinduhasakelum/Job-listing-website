import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaUser, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaCamera, FaExclamationCircle } from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const JobSeekerProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get state from navigation (if coming from job application)
  const returnTo = location.state?.returnTo;
  const jobTitle = location.state?.jobTitle;
  const fromApplication = !!returnTo;

  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    contact_number: "",
    birthday: "",
    gender: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/register-login");
        return;
      }

      const { data } = await axios.get(`${API_BASE_URL}/user/jobseeker/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Profile exists - populate form for editing
      setExistingProfile(data);
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
      // Profile doesn't exist - show empty form
      if (err.response?.status === 404) {
        setExistingProfile(null);
      } else {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== "jobseeker") {
      navigate("/");
      return;
    }

    fetchProfile();
  }, [user, navigate, fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPG or PNG image");
        return;
      }

      // Validate file size (max 2MB)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.birthday) {
      setError("Birthday is required");
      return;
    }

    if (!formData.gender) {
      setError("Gender is required");
      return;
    }

    // Validate contact number format
    if (formData.contact_number && !/^\+?[\d\s-()]+$/.test(formData.contact_number)) {
      setError("Please enter a valid contact number");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/register-login");
        return;
      }

      // Create form data
      const data = new FormData();
      data.append("full_name", formData.full_name.trim());
      data.append("address", formData.address.trim());
      data.append("contact_number", formData.contact_number.trim());
      data.append("birthday", formData.birthday);
      data.append("gender", formData.gender);

      if (profilePicture) {
        data.append("profile_picture", profilePicture);
      }

      // Create or update profile
      if (existingProfile) {
        await axios.patch(`${API_BASE_URL}/user/jobseeker/details`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Profile updated successfully!");
        
        // If coming from job application, redirect back
        if (returnTo) {
          setTimeout(() => {
            navigate(returnTo);
          }, 1500);
        } else {
          setTimeout(() => {
            fetchProfile();
            setSuccess("");
          }, 2000);
        }
      } else {
        await axios.post(`${API_BASE_URL}/user/jobseeker/details`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        
        if (returnTo) {
          setSuccess("Profile created successfully! Redirecting back to job...");
          setTimeout(() => {
            navigate(returnTo);
          }, 1500);
        } else {
          setSuccess("Profile created successfully! You can now apply for jobs.");
          setTimeout(() => {
            fetchProfile();
            setSuccess("");
          }, 2000);
        }
      }

    } catch (err) {
      console.error("Submit error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save profile. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/user/jobseeker/profile-picture`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfilePicture(null);
      setProfilePicturePreview(null);
      setSuccess("Profile picture deleted successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete profile picture");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Application Context Banner */}
        {fromApplication && !existingProfile && (
          <div className="mb-6 rounded-xl border-2 border-orange-300 bg-orange-50 p-5">
            <div className="flex items-start gap-3">
              <FaExclamationCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">
                  Profile Required to Apply
                </h3>
                <p className="mt-1 text-sm text-orange-800">
                  {jobTitle && (
                    <>
                      You're applying for <strong>{jobTitle}</strong>.{" "}
                    </>
                  )}
                  Please complete your profile first. This helps employers learn more about you and is required for all job applications.
                </p>
                <p className="mt-2 text-xs text-orange-700">
                  ✓ Quick to complete • ✓ Required for applications • ✓ Helps employers know you
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {existingProfile ? "Edit Your Profile" : "Create Your Profile"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {existingProfile
              ? "Update your information to keep your profile current"
              : "Complete your profile to start applying for jobs"}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
            ✓ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Profile Picture */}
          <div className="mb-8 text-center">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Profile Picture
            </label>
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
            {profilePicturePreview && existingProfile && (
              <button
                type="button"
                onClick={handleDeleteProfilePicture}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove picture
              </button>
            )}
            <p className="text-xs text-slate-500">JPG or PNG, max 2MB</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <FaUser className="h-4 w-4 text-slate-400" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-50 disabled:opacity-50"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label
                htmlFor="contact_number"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <FaPhone className="h-4 w-4 text-slate-400" />
                Contact Number
              </label>
              <input
                id="contact_number"
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-50 disabled:opacity-50"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <FaMapMarkerAlt className="h-4 w-4 text-slate-400" />
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                rows={3}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-50 disabled:opacity-50"
              />
            </div>

            {/* Birthday */}
            <div>
              <label
                htmlFor="birthday"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <FaBirthdayCake className="h-4 w-4 text-slate-400" />
                Birthday <span className="text-red-500">*</span>
              </label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
                required
                disabled={submitting}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-50 disabled:opacity-50"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {["Male", "Female", "Other"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className="h-4 w-4 border-slate-300 text-purple-600 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
                    />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => returnTo ? navigate(returnTo) : navigate(-1)}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {fromApplication ? "Back to Job" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-3 text-sm font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Saving...
                </span>
              ) : existingProfile ? (
                "Update Profile"
              ) : fromApplication ? (
                "Create Profile & Continue"
              ) : (
                "Create Profile"
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        {!existingProfile && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium mb-2">Why do I need a profile?</p>
            <ul className="ml-4 list-disc space-y-1 text-xs">
              <li>Employers can view your basic information</li>
              <li>Your profile helps match you with relevant jobs</li>
              <li>Required before you can apply for any position</li>
              <li>You can update your profile anytime</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerProfileForm;
