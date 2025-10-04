import React from "react";

function SuggestJobCard({
  jobTitle = "Frontend Developer",
  companyName = "Google Inc.",
  companyLogo = "https://cdn-icons-png.flaticon.com/512/281/281764.png",
  jobType = "Full Time",
  workLocation = "Remote",
  salary = "$90k - $120k / yr",
  description = "We're looking for a passionate developer experienced with React and Tailwind CSS to join our dynamic frontend team.",
  onApply = () => {}
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]">
      {/* Horizontal Layout Container */}
      <div className="flex items-center gap-6">
        
        {/* Left Section: Company Logo + Job Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <img
              src={companyLogo}
              alt={`${companyName} Logo`}
              className="w-14 h-14 rounded-full object-contain bg-gray-50 p-2 hover:rotate-3 transition-transform duration-300"
            />
          </div>

          {/* Job Title and Company */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {jobTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {companyName}
            </p>
            
            {/* Job Type and Location Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium text-xs">
                {jobType}
              </span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium text-xs">
                {workLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Description */}
        <div className="hidden md:block flex-1 px-4">
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        </div>

        {/* Right Section: Salary + Apply Button */}
        <div className="flex flex-col items-end gap-3 min-w-0 flex-shrink-0">
          <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
            {salary}
          </span>
          
          <button
            onClick={onApply}
            className="px-6 py-2 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Mobile Description (shown only on smaller screens) */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default SuggestJobCard;