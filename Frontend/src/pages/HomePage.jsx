// src/pages/HomePage.jsx
import React from "react";
import { motion } from "framer-motion";
import SearchAndFilter from "../components/SearchAndFilter";
import HomeJobCard from "../components/HomeJobCard";

function HomePage() {
  const jobCards = [1, 2, 3, 4, 5, 6]; // Temporary list for demo

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SearchAndFilter />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold mt-10 text-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        Featured <span className="text-purple-600">Jobs</span>
      </motion.h1>

      {/* Job Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {jobCards.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.03 }}
          >
            <HomeJobCard />
          </motion.div>
        ))}
      </div>

      {/* View More Button */}
      <motion.div
        className="flex justify-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium hover:opacity-90 hover:scale-105 transition-transform duration-300 shadow-md">
          View More Jobs
        </button>
      </motion.div>
    </div>
  );
}

export default HomePage;
