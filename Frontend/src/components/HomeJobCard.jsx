import React from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring" } },
  hover: { y: -8, scale: 1.03, transition: { type: "spring", stiffness: 250 } },
};

function HomeJobCard() {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 flex flex-col justify-between cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Top Section: Company + Logo */}
      <div className="flex items-center gap-4 mb-4">
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
          alt="Google Logo"
          className="w-12 h-12 rounded-full object-contain bg-gray-50 p-2"
          whileHover={{ rotate: 10 }}
          transition={{ type: "spring", stiffness: 150 }}
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Frontend Developer
          </h3>
          <p className="text-sm text-gray-500">Google Inc.</p>
        </div>
      </div>

      {/*Job Info */}
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
          Full Time
        </span>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
          Remote
        </span>
        <span className="text-gray-500 ml-auto">$90k - $120k / yr</span>
      </div>

      {/* Description */}
      <motion.p
        className="text-gray-600 text-sm mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        We’re looking for a passionate developer experienced with React and
        Tailwind CSS to join our dynamic frontend team.
      </motion.p>

      {/* Apply Now Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="mt-auto w-full py-2 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition"
      >
        Apply Now
      </motion.button>
    </motion.div>
  );
}

export default HomeJobCard;
