import React from "react";
import { motion } from "framer-motion";

import SearchAndFilter from "../components/SearchAndFilter";
import SuggestJobCard from "../components/SuggestJobCard";

function FindJobsPage() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 flex flex-col items-center py-12 px-4">
      <SearchAndFilter />
      <div className="flex flex-col gap-4 mt-8">
          <motion.h1
          className="text-3xl md:text-4xl font-bold text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Suggested <span className="text-purple-600">Jobs</span>
        </motion.h1>
        <SuggestJobCard />
        <SuggestJobCard />
        <SuggestJobCard />
      </div>
    </div>
  );
}

export default FindJobsPage;
