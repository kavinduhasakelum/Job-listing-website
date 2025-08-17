import React from "react";

function JobPostForm() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center max-w-lg w-full mx-6">
      <h1 className="text-2xl font-bold mb-6">Post a job</h1>
      <form className="flex flex-col gap-5  justify-center">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Job title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="e.g. Software Engineer"
            className="w-full border border-gray-300 rounded-lg p-2 placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label htmlFor="company" className="block font-medium mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            placeholder="e.g. Tech Innovators Inc."
            className="w-full border border-gray-300 rounded-lg p-2 placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2 placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label htmlFor="requirements" className="block font-medium mb-1">
            Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-2 placeholder-gray-400"
            required
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="salaryMin" className="block font-medium mb-1">
              Salary Range
            </label>
            <input
              type="number"
              id="salaryMin"
              name="salaryMin"
              placeholder="Minimum"
              className="w-full border border-gray-300 rounded-lg p-2 placeholder-gray-400"
            />
          </div>
          <div className="flex-1 mt-6">
            <input
              type="number"
              id="salaryMax"
              name="salaryMax"
              placeholder="Maximum"
              className="w-full border border-gray-300 rounded-lg p-2 placeholder-gray-400"
            />
          </div>
        </div>
        <div>
          <label htmlFor="logo" className="block font-medium mb-1">
            Company Logo
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-400"
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          className=" bg-blue-500 text-white rounded-lg px-4 py-2 mt-2 hover:bg-blue-600"
        >
          Post Job
        </button>
      </form>
      </div>
  </div>
  );
}

export default JobPostForm;
