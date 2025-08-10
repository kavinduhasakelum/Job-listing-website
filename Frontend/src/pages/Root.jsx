import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

function Root() {
  return (
    <>
      <NavBar />
      <main className="mx-auto flex flex-col gap-6 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </>
  );
}

export default Root;
