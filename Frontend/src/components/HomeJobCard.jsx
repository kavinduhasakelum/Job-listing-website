import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring" } },
  hover: { y: -8, scale: 1.03, transition: { type: "spring", stiffness: 250 } },
};

function HomeJobCard({ job }) {
  const navigate = useNavigate();

  // Default values if job is not provided
  const jobData = job || {
    job_id: null,
    title: "Frontend Developer",
    company_name: "Google Inc.",
    company_logo: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
    job_type: "Full-Time",
    work_type: "Remote",
    salary_min: 90000,
    salary_max: 120000,
    description: "We're looking for a passionate developer experienced with React and Tailwind CSS to join our dynamic frontend team.",
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not disclosed";
    const formatNum = (num) => {
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
      return `$${num}`;
    };
    if (min && max) return `${formatNum(min)} - ${formatNum(max)} / yr`;
    if (min) return `From ${formatNum(min)} / yr`;
    if (max) return `Up to ${formatNum(max)} / yr`;
  };

  const handleApplyClick = () => {
    if (jobData.job_id) {
      navigate(`/job/${jobData.job_id}`);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 flex flex-col justify-between cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={handleApplyClick}
    >
      {/* Top Section: Company + Logo */}
      <div className="flex items-center gap-4 mb-4">
        <motion.img
          src={jobData.company_logo || "https://cdn-icons-png.flaticon.com/512/2942/2942156.png"}
          alt={`${jobData.company_name} Logo`}
          className="w-12 h-12 rounded-full object-contain bg-gray-50 p-2"
          whileHover={{ rotate: 10 }}
          transition={{ type: "spring", stiffness: 150 }}
          onError={(e) => {
            e.target.src = "https://cdn-icons-png.flaticon.com/512/2942/2942156.png";
          }}
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {jobData.title}
          </h3>
          <p className="text-sm text-gray-500">{jobData.company_name}</p>
        </div>
      </div>

      {/*Job Info */}
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
          {jobData.job_type || "Full-Time"}
        </span>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
          {jobData.work_type || "Remote"}
        </span>
        <span className="text-gray-500 ml-auto">
          {formatSalary(jobData.salary_min, jobData.salary_max)}
        </span>
      </div>

      {/* Description */}
      <motion.p
        className="text-gray-600 text-sm mb-5 line-clamp-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {jobData.description || "No description available"}
      </motion.p>

      {/* Apply Now Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="mt-auto w-full py-2 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition"
        onClick={(e) => {
          e.stopPropagation();
          handleApplyClick();
        }}
      >
        Apply Now
      </motion.button>
    </motion.div>
  );
}

export default HomeJobCard;
