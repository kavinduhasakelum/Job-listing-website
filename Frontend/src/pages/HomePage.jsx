import React from "react";
import NavBar from "../components/NavBar";
import SearchAndFilter from "../components/SearchAndFilter";
import HomeJobCard from "../components/HomeJobCard";

function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Full-width NavBar */}
      <NavBar />

      {/* Universal X-axis spacing for all Home content */}
      <main className="mx-auto flex flex-col gap-6 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <SearchAndFilter />
        <h1 className="text-3xl font-bold mt-8">Featured Jobs</h1>
        <HomeJobCard />
        <HomeJobCard />
        <HomeJobCard />
      </main>
    </div>
  );
}

export default HomePage;
