import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

function Root() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative">
      <NavBar />

      <main className="flex-grow mx-auto flex flex-col gap-6 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />

      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsChatOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-orange-500 text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-transform duration-300 z-50"
      >
        {isChatOpen ? (
          // Close icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Chat bubble icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h8m-8 4h5m-1 6l-5-5H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-3l-5 5z"
            />
          </svg>
        )}
      </button>

      {/* Popup Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold text-lg">WorkNest Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="hover:opacity-80"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-64 overflow-y-auto space-y-3 bg-gray-50">
              <div className="text-sm text-gray-700 bg-white p-2 rounded-lg shadow-sm w-fit">
                Hi there 👋 How can we help you?
              </div>
              <div className="text-sm text-white bg-purple-600 p-2 rounded-lg shadow-sm w-fit ml-auto">
                I want to know about job posting.
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-3 py-2 rounded-xl hover:scale-105 transition-transform">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Root;
