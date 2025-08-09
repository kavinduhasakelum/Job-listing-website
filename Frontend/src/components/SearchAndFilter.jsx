import React from "react";
function SearchAndFilter() {
  return (
    <div className="flex flex-col justify-start items-stretch w-[450px] gap-4 mt-8">
      <h2 className="text-4xl font-bold mb-4">Find the right job for you</h2>
      <div className="relative hidden sm:block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search"
          className="h-10 w-full rounded-xl bg-gray-100 border border-gray-200 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select className="border border-gray-300 rounded-xl p-2">
        <option value="">Location</option>
        <option value="engineering">Engineering</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
      </select>
      <select className="border border-gray-300 rounded-xl p-2">
        <option value="">Job</option>
        <option value="engineering">Engineering</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
      </select>
      <button className="bg-blue-500 text-white rounded-xl p-2 focus:ring-blue-500">Search</button>
    </div>
  );
}

export default SearchAndFilter;
