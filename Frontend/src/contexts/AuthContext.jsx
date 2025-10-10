import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";

// Auth action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_USER: "SET_USER",
  SET_EMPLOYER_PROFILE: "SET_EMPLOYER_PROFILE",
};

// Initial auth state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
  employerProfile: null,
  employerProfileLoading: false,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        employerProfile: action.payload.employerProfile ?? state.employerProfile,
        employerProfileLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        employerProfile: null,
        employerProfileLoading: false,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.SET_EMPLOYER_PROFILE:
      return {
        ...state,
        employerProfile:
          action.payload.profile !== undefined
            ? action.payload.profile
            : state.employerProfile,
        employerProfileLoading: action.payload.loading ?? false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// API base URL constant (outside component to prevent re-creation)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const {
    user,
    token,
    isAuthenticated,
    employerProfile,
    employerProfileLoading,
  } = state;
  const isEmployerRole = user?.role?.toLowerCase() === "employer";

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        // Verify token with backend
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        const response = await axios.get(`${API_BASE_URL}/auth/verify`);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: storedToken,
          },
        });
      } catch {
        // Token is invalid, remove it
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []); // Empty dependency array since API_BASE_URL is now a constant

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        name_or_email: email,
        password: password,
      });

      const { token, user, message } = response.data;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed. Please try again.";

      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }, []); // Empty dependency array for useCallback

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );

      return {
        success: true,
        message:
          response.data?.message ||
          "Registration successful. Please verify your email.",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []); // Empty dependency array for useCallback

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const fetchEmployerProfile = useCallback(
    async ({ force = false } = {}) => {
      if (!isEmployerRole || !token) {
        if (employerProfile !== null || employerProfileLoading) {
          dispatch({
            type: AUTH_ACTIONS.SET_EMPLOYER_PROFILE,
            payload: { profile: null, loading: false },
          });
        }
        return null;
      }

      if (employerProfile && !force) {
        return employerProfile;
      }

      try {
        dispatch({
          type: AUTH_ACTIONS.SET_EMPLOYER_PROFILE,
          payload: { profile: employerProfile ?? undefined, loading: true },
        });

        const response = await axios.get(
          `${API_BASE_URL}/user/employer/details`
        );

        dispatch({
          type: AUTH_ACTIONS.SET_EMPLOYER_PROFILE,
          payload: { profile: response.data, loading: false },
        });

        return response.data;
      } catch (error) {
        console.error("Failed to load employer profile", error);
        dispatch({
          type: AUTH_ACTIONS.SET_EMPLOYER_PROFILE,
          payload: { profile: null, loading: false },
        });
        return null;
      }
    },
    [
      isEmployerRole,
      token,
      employerProfile,
      employerProfileLoading,
      dispatch,
    ]
  );

  useEffect(() => {
    if (isAuthenticated && isEmployerRole) {
      fetchEmployerProfile();
    } else if (!isEmployerRole && (employerProfile || employerProfileLoading)) {
      dispatch({
        type: AUTH_ACTIONS.SET_EMPLOYER_PROFILE,
        payload: { profile: null, loading: false },
      });
    }
  }, [
    isAuthenticated,
    isEmployerRole,
    fetchEmployerProfile,
    employerProfile,
    employerProfileLoading,
    dispatch,
  ]);

  // Update user profile
  const updateUser = useCallback(
    (userData) => {
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: { ...state.user, ...userData },
      });
    },
    [state.user]
  );

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      return state.user?.role?.toLowerCase() === role.toLowerCase();
    },
    [state.user?.role]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles) => {
      return roles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => hasRole("admin"), [hasRole]);

  // Check if user is employer
  const isEmployer = useCallback(() => hasRole("employer"), [hasRole]);

  // Check if user is job seeker
  const isJobSeeker = useCallback(() => hasRole("jobseeker"), [hasRole]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // State
      ...state,

      // Methods
      login,
      register,
      logout,
      updateUser,
      clearError,
      fetchEmployerProfile,

      // Role checks
      hasRole,
      hasAnyRole,
      isAdmin,
      isEmployer,
      isJobSeeker,
    }),
    [
      state,
      login,
      register,
      logout,
      updateUser,
      clearError,
      fetchEmployerProfile,
      hasRole,
      hasAnyRole,
      isAdmin,
      isEmployer,
      isJobSeeker,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
