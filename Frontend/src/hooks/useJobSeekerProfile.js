import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Custom hook to check if the current job seeker has a profile
 * Returns: { hasProfile, loading, checkProfile }
 */
export const useJobSeekerProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = useCallback(async () => {
    // Only check for job seekers
    if (!isAuthenticated || !user || user.role !== "jobseeker") {
      setHasProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setHasProfile(false);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/user/jobseeker/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setHasProfile(true);
      } else if (response.status === 404) {
        setHasProfile(false);
      } else {
        setHasProfile(null);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      setHasProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  return { hasProfile, loading, checkProfile };
};
