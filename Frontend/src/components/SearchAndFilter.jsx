import React from "react";
import DropDown from "./DropDown";
import Button from "./Button";

function SearchAndFilter() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fadeIn">
          Find the <span className="text-purple-600">right job</span> for you
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover amazing opportunities and take the next step in your career journey
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title or Keywords
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
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
                placeholder="e.g. Frontend Developer, Designer..."
                className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <DropDown className="w-full h-12" />
          </div>

          {/* Job Type Filter */}
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <DropDown className="w-full h-12" />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            Name="Search Jobs" 
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform  transition-all duration-200"
          />
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Remote Jobs', 'Full Time', 'Part Time', 'Frontend', 'Backend', 'UI/UX Designer'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchAndFilter;
