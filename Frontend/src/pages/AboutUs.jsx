import React from "react";
import { motion } from "framer-motion";
import TeamCard from "../components/TeamCard";

const teamMembers = [
  { name: "Dan D.", role: "Frontend Developer", img: "https://randomuser.me/api/portraits/men/32.jpg", linkedin: "#" },
  { name: "Costa M.", role: "Backend Engineer", img: "https://randomuser.me/api/portraits/men/45.jpg", linkedin: "#" },
  { name: "Nethmi S.", role: "UI/UX Designer", img: "https://randomuser.me/api/portraits/women/65.jpg", linkedin: "#" },
  { name: "Dineth P.", role: "Project Manager", img: "https://randomuser.me/api/portraits/men/12.jpg", linkedin: "#" },
];

export default function AboutUs() {
  return (
    <div className="bg-white text-gray-800 min-h-screen flex flex-col items-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl text-center">
        <motion.h1 className="text-4xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
          About WorkNest
        </motion.h1>

        <motion.p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          At <span className="font-semibold text-purple-600">WorkNest</span>, we’re building the bridge between passionate professionals and innovative companies.
          Our mission is to make finding your dream job seamless, efficient, and empowering.
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-8 mt-10">
          {[
            { title: "Our Mission", desc: "Empowering individuals by connecting them with the right opportunities.", icon: "🚀" },
            { title: "Our Vision", desc: "A world where talent meets purpose and every job seeker thrives.", icon: "🌍" },
            { title: "Our Values", desc: "Integrity, innovation, and inclusivity at the heart of everything we do.", icon: "💡" },
          ].map((item, i) => (
            <motion.div key={i} className="p-6 bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl shadow-md hover:shadow-lg transition-all" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-16" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-2xl font-semibold shadow-md hover:scale-105 transition-transform">
            Join Our Journey
          </button>
        </motion.div>
      </motion.div>

      <div className="max-w-6xl w-full mt-16 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((m, idx) => <TeamCard key={idx} {...m} />)}
        </div>
      </div>
    </div>
  );
}
