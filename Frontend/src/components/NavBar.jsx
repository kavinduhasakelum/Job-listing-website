import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isEmployer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/register');
  };

  const handleProfileClick = () => {
    if (isAdmin()) {
      navigate('/admin');
    } else if (isEmployer()) {
      navigate('/employer-dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Left: Brand + Desktop Links */}
        <div className="flex items-center justify-between gap-8 min-w-0">
          <a href="/" className="shrink-0 flex items-center group">
            <span className="text-2xl md:text-3xl font-extrabold transition-transform duration-300 group-hover:scale-105">
              <span className="text-purple-600">Work</span>
              <span className="text-orange-500">Nest</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            {["Home", "Jobs", "Companies", "Salaries", "Career Advice"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-purple-600 transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Right: Search + Notification + CTA + Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-44 md:w-64 rounded-xl bg-gray-100 border border-gray-200 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
            />
          </div>

          {/* Notification Icon */}
          <button
            type="button"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5 text-gray-700"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-9.33-4.94M6 9v5.159c0 .538-.214 1.055-.595 1.436L4 17h5"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* CTA - Show different buttons based on auth status */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {(isEmployer() || isAdmin()) && (
                <button
                  type="button"
                  onClick={() => navigate('/post-job')}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-medium hover:opacity-90 hover:scale-105 shadow-md transition-transform duration-300"
                >
                  Post a Job
                </button>
              )}
              
              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:scale-105 transition-transform duration-300 cursor-pointer bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-bold flex items-center justify-center"
                >
                  {user?.name?.charAt(0)?.toUpperCase() || user?.userName?.charAt(0)?.toUpperCase() || 'U'}
                </button>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="h-10 px-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors duration-300"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-medium hover:opacity-90 hover:scale-105 shadow-md transition-transform duration-300"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="h-10 px-4 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors duration-300"
              >
                Login
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center md:hidden w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-nav"
            aria-expanded={open}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={`${open ? "block" : "hidden"} md:hidden border-t border-gray-200`}
      >
        <div className="px-4 py-3 space-y-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-full rounded-xl bg-gray-100 border border-gray-200 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <ul className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            {["Home", "Jobs", "Companies", "Salaries", "Career Advice"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="px-2 py-2 rounded-lg hover:bg-gray-100 hover:text-purple-600 transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>

          {isAuthenticated ? (
            <div className="space-y-2">
              {(isEmployer() || isAdmin()) && (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/postjob');
                    setOpen(false);
                  }}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-medium shadow hover:opacity-90 transition"
                >
                  Post a Job
                </button>
              )}
              
              <button
                onClick={() => {
                  handleProfileClick();
                  setOpen(false);
                }}
                className="w-full h-10 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                {isAdmin() ? 'Admin Dashboard' : isEmployer() ? 'Dashboard' : 'Profile'}
              </button>
              
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full h-10 rounded-xl bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  navigate('/register');
                  setOpen(false);
                }}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-medium shadow hover:opacity-90 transition"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/register');
                  setOpen(false);
                }}
                className="w-full h-10 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
