import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700">
      <div className="max-w-screen-xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Logo + Description */}
        <div>
          <h2 className="text-3xl font-extrabold text-purple-600 tracking-tight">
            Work<span className="text-orange-500">Nest</span>
          </h2>
          <p className="mt-4 text-sm leading-6 text-gray-600 max-w-xs">
            Helping you connect with the right opportunities and grow your career effortlessly.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-purple-600 transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-purple-600 transition">About Us</Link></li>
            <li><Link to="/jobs" className="hover:text-purple-600 transition">Jobs</Link></li>
            <li><Link to="/testimonials" className="hover:text-purple-600 transition">Testimonials</Link></li>
            <li><Link to="/contact" className="hover:text-purple-600 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Follow Us with Icons */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900">Follow Us</h3>
          <ul className="flex space-x-4 mt-2">
            <li>
              <a href="#" className="text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200 text-xl">
                <FaFacebookF />
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200 text-xl">
                <FaInstagram />
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200 text-xl">
                <FaLinkedinIn />
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200 text-xl">
                <FaTwitter />
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200 text-xl">
                <FaYoutube />
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              <a
                href="tel:+94712345678"
                className="flex items-center gap-2 text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200"
              >
                <FaPhoneAlt />
                +94 71 234 5678
              </a>
            </li>
            <li>
              <a
                href="mailto:support@worknest.com"
                className="flex items-center gap-2 text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200"
              >
                <FaEnvelope />
                support@worknest.com
              </a>
            </li>
            <li>
              <a
                href="https://maps.google.com?q=123+Main+Street+Colombo+Sri+Lanka"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 hover:text-purple-600 hover:scale-110 transition-transform duration-200"
              >
                <FaMapMarkerAlt />
                123 Main Street, Colombo, Sri Lanka
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-gray-50 py-5 text-center text-sm text-gray-500">
        © 2024 WorkNest. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
