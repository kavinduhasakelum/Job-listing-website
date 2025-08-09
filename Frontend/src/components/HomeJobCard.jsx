import React from "react";
function HomeJobCard() {
  return (
    <div className="flex flex-wrap justify-between items-stretch gap-6">
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-bold">Software Engineer</h2>
        <p className="text-sm text-gray-600">
          Develop and maintain web applications using modern technologies.
        </p>
        <button className="w-[100px] text-[14px] font-semibold bg-gray-300 hover:bg-gray-500 rounded-xl p-2">Apply Now</button>
      </div>
      <div className="h-[200px] w-[400px] bg-gray-500 rounded-2xl"></div>
    </div>
  );
}

export default HomeJobCard;
