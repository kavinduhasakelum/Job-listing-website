import React from "react";
import { useNavigate } from "react-router-dom";

const formatSalaryRange = (salaryMin, salaryMax) => {
  const min = Number(salaryMin);
  const max = Number(salaryMax);
  
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }
  if (min) {
    return `From $${min.toLocaleString()}`;
  }
  if (max) {
    return `Up to $${max.toLocaleString()}`;
  }
  return "Salary not specified";
};

const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString();
};

const toTitleCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function JobCard({ job }) {
  const navigate = useNavigate();

  const handleViewJob = () => {
    navigate(`/job?jobId=${job.job_id}`, {
      state: { job }
    });
  };

  const workType = toTitleCase(job.work_type);
  const jobType = toTitleCase(job.job_type);
  const experienceLevel = toTitleCase(job.experience_level);
  const industry = toTitleCase(job.industry);

  const tags = [workType, jobType, experienceLevel, industry].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 cursor-pointer group">
      <div onClick={handleViewJob}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {job.company_logo ? (
            <img
              src={job.company_logo}
              alt={`${job.company || "Company"} logo`}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
              {(job.company || job.title || "J").charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {job.company || "Company Confidential"} • {job.location}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {formatDate(job.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {job.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-900">
              {formatSalaryRange(job.salary_min, job.salary_max)}
            </span>
            {job.views && (
              <span className="text-xs text-slate-500">
                {job.views} views
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewJob();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            View Details
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;