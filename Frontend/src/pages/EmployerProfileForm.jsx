import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const initialState = {
  company_name: "",
  company_address: "",
  company_website: "",
  contact_number: "",
  industry: "",
  description: "",
};

function EmployerProfileForm() {
  const navigate = useNavigate();
  const { isEmployer } = useAuth();
  const [formValues, setFormValues] = useState(initialState);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!isEmployer()) {
        if (isMounted) setCheckingProfile(false);
        return;
      }

      try {
        await axios.get(`${API_BASE_URL}/user/employer/details`);
        if (isMounted) {
          setHasProfile(true);
        }
      } catch (profileError) {
        if (!isMounted) return;

        if (profileError.response?.status === 404) {
          setHasProfile(false);
        } else {
          setError(
            profileError.response?.data?.error ||
              profileError.message ||
              "Unable to check employer profile status."
          );
        }
      } finally {
        if (isMounted) setCheckingProfile(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [isEmployer]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setProfilePicture(file || null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormValues(initialState);
    setProfilePicture(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!formValues.company_name || !formValues.company_address) {
      setError("Company name and address are required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        payload.append(key, value ?? "");
      });

      if (profilePicture) {
        payload.append("profile_picture", profilePicture);
      }

      await axios.post(`${API_BASE_URL}/user/employer/details`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Employer profile created successfully.");
      resetForm();

      // Optionally navigate to a relevant page after a short delay
      setTimeout(() => {
        navigate("/post-job", { replace: true });
      }, 1200);
    } catch (submitError) {
      const message =
        submitError.response?.data?.error ||
        submitError.response?.data?.message ||
        submitError.message ||
        "Failed to create employer profile.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isEmployer()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-3xl font-semibold">Access restricted</h1>
          <p className="text-gray-600">
            Only employer accounts can create an employer profile. If you believe
            this is a mistake, please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking employer profile status...</div>
      </div>
    );
  }

  if (hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-3xl font-semibold">Profile already created</h1>
          <p className="text-gray-600">
            We've detected an existing employer profile for your account. You can
            update it from the employer dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate("/post-job")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Employer Tools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Create Employer Profile</h1>
        <p className="text-gray-600 mt-2">
          Provide your company details so job seekers can learn more about your organisation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
        encType="multipart/form-data"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="company_name" className="font-medium text-gray-800">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              value={formValues.company_name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. Tech Innovators Inc."
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="company_address" className="font-medium text-gray-800">
              Company Address <span className="text-red-500">*</span>
            </label>
            <input
              id="company_address"
              name="company_address"
              type="text"
              value={formValues.company_address}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. 123 Innovation Drive, Colombo"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="company_website" className="font-medium text-gray-800">
              Company Website
            </label>
            <input
              id="company_website"
              name="company_website"
              type="url"
              value={formValues.company_website}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="contact_number" className="font-medium text-gray-800">
              Contact Number
            </label>
            <input
              id="contact_number"
              name="contact_number"
              type="tel"
              value={formValues.contact_number}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. +94 71 123 4567"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label htmlFor="industry" className="font-medium text-gray-800">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              value={formValues.industry}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. Information Technology"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="font-medium text-gray-800">
            Company Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formValues.description}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Share a brief overview about your company, culture, and what makes you unique."
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium text-gray-800">Company Logo / Profile Picture</label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label
              htmlFor="profile_picture"
              className="inline-flex items-center justify-center rounded-xl border border-dashed border-gray-400 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 cursor-pointer"
            >
              Upload Image
            </label>
            <input
              id="profile_picture"
              name="profile_picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {profilePicture && (
              <span className="text-sm text-gray-600">
                {profilePicture.name}
              </span>
            )}
          </div>
          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Profile preview"
                className="h-24 w-24 rounded-full object-cover border border-gray-200"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            disabled={submitting}
          >
            Clear
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployerProfileForm;
