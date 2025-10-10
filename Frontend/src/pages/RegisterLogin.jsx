import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// SQL Query for reference
export const CREATE_USER = `
  INSERT INTO users (userName, email, password, role)
  VALUES (?, ?, ?, ?)
`;

function RegisterLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    login, 
    register, 
    isAuthenticated, 
    loading, 
    error, 
    clearError 
  } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "jobseeker", // Default role
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Redirect to intended destination or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when switching between login/register
  React.useEffect(() => {
    clearError();
    setStatusMessage('');
  }, [isLogin, clearError]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    clearError();

    if (!isLogin) {
      // Register form validation
      if (formData.password !== formData.confirmPassword) {
        setStatusMessage('Passwords do not match!');
        return;
      }

      setLocalLoading(true);

      const result = await register({
        name: formData.userName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setLocalLoading(false);

      if (result.success) {
        setStatusMessage(result.message);
        // Switch to login mode after successful registration
        setIsLogin(true);
        setFormData({
          userName: "",
          email: formData.email,
          password: "",
          confirmPassword: "",
          role: "jobseeker",
        });
      }
    } else {
      // Login
      setLocalLoading(true);
      
      const result = await login(formData.email, formData.password);
      
      setLocalLoading(false);

      if (result.success) {
        setStatusMessage(result.message || 'Login successful!');
        // AuthContext will handle the redirect via useEffect above
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex justify-center items-center py-12 px-4">
      <div className="w-full min-w-lg pb-">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {isLogin ? "Welcome Back!" : "Join WorkNest"}
            </h2>
            <p className="text-purple-100 text-center mt-1 text-sm">
              {isLogin
                ? "Sign in to your account"
                : "Create your account to get started"}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field (Register only) */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Confirm Password Field (Register only) */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Role Selection (Register only) */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    I am a <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    required={!isLogin}
                  >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={localLoading || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {(localLoading || loading)
                  ? isLogin
                    ? "Signing In..."
                    : "Creating Account..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>
            {statusMessage && (
              <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                {statusMessage}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          {/* Switch between Login/Register */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors duration-200"
                    onClick={() => {
                      setIsLogin(false);
                      setFormData({
                        userName: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        role: "job_seeker",
                      });
                    }}
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors duration-200"
                    onClick={() => {
                      setIsLogin(true);
                      setFormData({
                        userName: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        role: "job_seeker",
                      });
                    }}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterLogin;
