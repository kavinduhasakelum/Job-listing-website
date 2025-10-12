import React from "react";
import { motion } from "framer-motion";
import SearchAndFilter from "../components/SearchAndFilter";
import HomeJobCard from "../components/HomeJobCard";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const logos = [
  {
    src: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
    alt: "Google",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    alt: "Amazon",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
    alt: "Microsoft",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
    alt: "Figma",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/5968/5968520.png",
    alt: "Adobe",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",
    alt: "Meta",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/5968/5968709.png",
    alt: "Netflix",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/174/174872.png",
    alt: "Spotify",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/733/733553.png",
    alt: "GitHub",
  },
  {
    src: "https://cdn-icons-png.flaticon.com/512/3536/3536505.png",
    alt: "LinkedIn",
  },
];

const rand = (min, max) => Math.random() * (max - min) + min;

function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const jobCards = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full bg-white text-gray-900 overflow-hidden relative">
      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto flex flex-col items-center text-center py-28 px-4 overflow-hidden">
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 -z-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(circle at 70% 70%, rgba(249,115,22,0.2), transparent 60%)",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Tech Icons */}
        {logos.map((logo, i) => {
          const size = 35 + Math.random() * 20;
          const startX = rand(-500, 500);
          const startY = rand(-300, 300);
          const moveX = rand(-80, 80);
          const moveY = rand(-60, 60);
          const delay = i * 0.5;

          return (
            <motion.img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="absolute rounded-full bg-white/50 backdrop-blur-md shadow-md p-2 object-contain z-0"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: "50%",
                left: "50%",
                x: startX,
                y: startY,
              }}
              animate={{
                x: [startX, startX + moveX, startX - moveX, startX],
                y: [startY, startY - moveY, startY + moveY, startY],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 20 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            />
          );
        })}

        {/* Badge */}
        <motion.div
          className="px-4 py-1 bg-orange-100 text-orange-700 text-xs rounded-full mb-4 font-medium z-10 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isAuthenticated && user ? `Welcome back, ${user.name || user.userName}! 👋` : "🏆 No.1 WorkNest Website"}
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold leading-tight mb-4 z-10 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Search, Apply & Get Your{" "}
          <span className="text-purple-600">Dream Job</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-gray-500 max-w-2xl mb-8 text-sm sm:text-base z-10 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Discover your next opportunity with top global tech companies.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 z-10 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NavLink to="/all-jobs">
            <motion.button
              whileHover={{
                scale: 1.1,
                y: -3,
                boxShadow: "0px 8px 25px rgba(168, 85, 247, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-2xl shadow-md font-semibold"
            >
              Browse Jobs
            </motion.button>
          </NavLink>

          <motion.button
            whileHover={{
              scale: 1.1,
              y: -3,
              boxShadow: "0px 8px 25px rgba(107, 114, 128, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-800 rounded-2xl shadow-md hover:bg-gray-200 font-semibold"
          >
            Upload Your CV?
          </motion.button>
        </motion.div>
      </section>

      {/* SEARCH + JOB SECTION
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4"
      >
        <SearchAndFilter />
      </motion.div> */}

      {/* Featured Jobs */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Featured <span className="text-purple-600">Jobs</span>
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {jobCards.map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.03 }}
            >
              <HomeJobCard />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <NavLink to="/all-jobs">
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-medium hover:opacity-90 hover:scale-105 transition-transform duration-300 shadow-md">
              View More Jobs
            </button>
          </NavLink>
        </motion.div>
      </section>
    </div>
  );
}

export default HomePage;
