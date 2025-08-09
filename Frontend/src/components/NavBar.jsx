import React, { useState } from "react";

function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Left: Brand + Desktop Links */}
        <div className="flex items-center justify-between gap-8 min-w-0">
          <a href="/" className="shrink-0">
            <span className="text-xl md:text-2xl font-semibold text-gray-900">WorkNest</span>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <li><a href="#" className="hover:text-gray-900">Home</a></li>
            <li><a href="#" className="hover:text-gray-900">Jobs</a></li>
            <li><a href="#" className="hover:text-gray-900">Companies</a></li>
            <li><a href="#" className="hover:text-gray-900">Salaries</a></li>
            <li><a href="#" className="hover:text-gray-900">Career Advice</a></li>
          </ul>
        </div>

        {/* Right: Search + CTA + Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search (hide on very small screens) */}
          <div className="relative hidden sm:block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-44 md:w-64 rounded-xl bg-gray-100 border border-gray-200 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CTA */}
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-300"
          >
            Post a Job
          </button>

          {/* Avatar */}
          <img
            src="https://i.pravatar.cc/80?img=5"
            alt="Profile avatar"
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center md:hidden w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-nav"
            aria-expanded={open}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="mobile-nav" className={`${open ? "block" : "hidden"} md:hidden border-t border-gray-200`}>
        <div className="px-4 py-3 space-y-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-full rounded-xl bg-gray-100 border border-gray-200 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            <li><a href="#" className="px-2 py-2 rounded-lg hover:bg-gray-100">Home</a></li>
            <li><a href="#" className="px-2 py-2 rounded-lg hover:bg-gray-100">Jobs</a></li>
            <li><a href="#" className="px-2 py-2 rounded-lg hover:bg-gray-100">Companies</a></li>
            <li><a href="#" className="px-2 py-2 rounded-lg hover:bg-gray-100">Salaries</a></li>
            <li><a href="#" className="px-2 py-2 rounded-lg hover:bg-gray-100">Career Advice</a></li>
          </ul>
          <button type="button" className="w-full h-10 rounded-xl bg-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-300">Post a Job</button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
