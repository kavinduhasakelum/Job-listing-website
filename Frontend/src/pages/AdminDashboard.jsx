import React, { useState } from "react";
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaPlusCircle,
  FaCog,
  FaSignOutAlt,
  FaEye,
  FaDollarSign,
} from "react-icons/fa";

// ====================== Sidebar ======================
function Sidebar({ open, setOpen }) {
  const menus = [
    { title: "Dashboard", icon: <FaHome /> },
    { title: "Job Listings", icon: <FaBriefcase /> },
    { title: "Applicants", icon: <FaUsers /> },
    { title: "Post New Job", icon: <FaPlusCircle /> },
    { title: "Settings", icon: <FaCog /> },
    { title: "Logout", icon: <FaSignOutAlt /> },
  ];

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-gradient-to-b from-indigo-700 to-orange-500 text-white h-screen p-4 fixed transition-all duration-300 shadow-lg`}
    >
      <div className="flex justify-between items-center mb-10">
        <h1 className={`text-2xl font-bold tracking-wide ${!open && "hidden"}`}>
          <span className="text-white">Work</span>
          <span className="text-orange-300">Nest</span>
        </h1>

        <button
          onClick={() => setOpen(!open)}
          className="text-white text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      <ul className="space-y-4">
        {menus.map((menu, i) => (
          <li
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 cursor-pointer transition"
          >
            <span className="text-lg">{menu.icon}</span>
            <span className={`${!open && "hidden"} text-sm font-medium`}>
              {menu.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ====================== Topbar ======================
function Topbar() {
  return (
    <div className="w-full flex justify-between items-center bg-white shadow px-6 py-3">
      <h2 className="font-semibold text-lg text-indigo-700">Admin Dashboard</h2>
      <div className="relative w-1/3">
        <input
          type="text"
          placeholder="Search jobs or applicants..."
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <img
        src="/assets/imgs/customer01.jpg"
        alt="user"
        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
      />
    </div>
  );
}

// ====================== Card Component ======================
function Card({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-orange-500 text-white p-6 rounded-2xl shadow hover:scale-[1.02] transition">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{value}</h2>
          <p className="text-sm text-white/90">{title}</p>
        </div>
        <div className="text-3xl opacity-90">{icon}</div>
      </div>
    </div>
  );
}

// ====================== Job Table ======================
function JobTable() {
  const jobs = [
    { title: "Frontend Developer", applicants: 45, status: "Active", salary: "$3000/mo" },
    { title: "Backend Engineer", applicants: 27, status: "Closed", salary: "$3500/mo" },
    { title: "UI/UX Designer", applicants: 19, status: "Active", salary: "$2800/mo" },
    { title: "Project Manager", applicants: 11, status: "Pending", salary: "$4000/mo" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-indigo-700">
          Recent Job Listings
        </h2>
        <button className="bg-gradient-to-r from-indigo-600 to-orange-500 text-white px-4 py-2 rounded-md text-sm shadow">
          View All
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2">Job Title</th>
            <th className="py-2">Applicants</th>
            <th className="py-2">Salary</th>
            <th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, i) => (
            <tr key={i} className="border-b hover:bg-indigo-50">
              <td className="py-2 font-medium">{job.title}</td>
              <td className="py-2 text-center">{job.applicants}</td>
              <td className="py-2 text-center">{job.salary}</td>
              <td className="py-2 text-right">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    job.status === "Active"
                      ? "bg-green-500"
                      : job.status === "Closed"
                      ? "bg-gray-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {job.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ====================== Applicants Table ======================
function ApplicantsTable() {
  const applicants = [
    { name: "John Doe", position: "Frontend Developer", status: "Reviewed" },
    { name: "Sara Lee", position: "UI/UX Designer", status: "Shortlisted" },
    { name: "Mark Smith", position: "Backend Engineer", status: "Interviewed" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold text-indigo-700 mb-4">
        Recent Applicants
      </h2>
      <table className="w-full">
        <tbody>
          {applicants.map((a, i) => (
            <tr key={i} className="hover:bg-indigo-50 border-b">
              <td className="py-3">
                <h4 className="text-sm font-medium">{a.name}</h4>
                <span className="text-xs text-gray-500">{a.position}</span>
              </td>
              <td className="py-3 text-right">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    a.status === "Shortlisted"
                      ? "bg-green-500"
                      : a.status === "Reviewed"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ====================== Admin Dashboard ======================
export default function AdminDashboard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar open={open} setOpen={setOpen} />
      {/* Dynamic margin */}
      <div
        className={`flex-1 bg-gray-50 min-h-screen transition-all duration-300 ${
          open ? "ml-64" : "ml-20"
        }`}
      >
        <Topbar />

        <div className="p-6 grid gap-6">
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Total Jobs" value="58" icon={<FaBriefcase />} />
            <Card title="Active Applicants" value="284" icon={<FaUsers />} />
            <Card title="Monthly Views" value="12,340" icon={<FaEye />} />
            <Card title="Total Earnings" value="$24,800" icon={<FaDollarSign />} />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <JobTable />
            </div>
            <ApplicantsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
