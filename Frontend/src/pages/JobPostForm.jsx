import React from "react";
import JobForm from "../components/JobForm";

function JobPostForm() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center max-w-lg w-full mx-6">
      <h1 className="text-2xl font-bold mb-6">Post a job</h1>
      <JobForm />
      </div>
  </div>
  );
}

export default JobPostForm;
