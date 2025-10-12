import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JobForm from "../components/JobForm";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function JobPostForm() {
  const navigate = useNavigate();
  const { isEmployer } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const employerCheck =
      typeof isEmployer === "function" ? isEmployer() : false;

    if (!employerCheck) {
      setHasProfile(false);
      setCheckingProfile(false);
      return () => {
        isMounted = false;
      };
    }

    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        await axios.get(`${API_BASE_URL}/user/employer/details`, {
          signal: controller.signal,
        });
        if (isMounted) {
          setHasProfile(true);
        }
      } catch (error) {
        if (!isMounted) return;

  if (typeof axios.isCancel === "function" && axios.isCancel(error)) {
          return;
        }

        if (error.response?.status === 404) {
          setHasProfile(false);
        } else {
          setProfileError(
            error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "We couldn't confirm your employer profile status."
          );
        }
      } finally {
        if (isMounted) {
          setCheckingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isEmployer]);

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading employer tools...</div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl space-y-4 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="text-gray-600">
            {profileError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl space-y-4 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Complete your employer profile
          </h1>
          <p className="text-gray-600">
            You need an approved employer profile before you can publish job listings. This helps candidates learn more about your organisation.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate("/employer/profile")}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Create employer profile
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center max-w-lg w-full mx-6">
        <h1 className="text-2xl font-bold mb-6">Post a job</h1>
        <JobForm />
      </div>
    </div>
  );
}

export default JobPostForm;
