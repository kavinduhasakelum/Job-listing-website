import React from "react";
import SearchAndFilter from "../components/SearchAndFilter";
import HomeJobCard from "../components/HomeJobCard";

function HomePage() {
  return (
    <>
      <SearchAndFilter />
      <h1 className="text-3xl font-bold mt-8">Featured Jobs</h1>
      <div className="flex flex-col gap-6 mt-4">
        <HomeJobCard />
        <HomeJobCard />
        <HomeJobCard />
      </div>
    </>
  );
}

export default HomePage;
