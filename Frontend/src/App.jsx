import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages (add or keep existing ones)
import Root from "./pages/Root";
import HomePage from "./pages/HomePage";
import JobView from "./pages/JobView";
import SearchJob from "./pages/SearchJob";
import RegisterLogin from "./pages/RegisterLogin";
import JobPostForm from "./pages/JobPostForm";
import ChatPage from "./pages/Chat";
import FindJobsPage from "./pages/FindJobsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs"; // <-- NEW

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />, // layout with NavBar + Footer + <Outlet />
    children: [
      { index: true, element: <HomePage /> },
      { path: "job", element: <JobView /> },
      { path: "jobs", element: <SearchJob /> },
      { path: "register", element: <RegisterLogin /> },
      { path: "postjob", element: <JobPostForm /> },
      { path: "search", element: <SearchJob /> },
      { path: "chat", element: <ChatPage /> },
      { path: "find-jobs", element: <FindJobsPage /> },
      { path: "about", element: <AboutUs /> }, // <-- ABOUT ROUTE
    ],
  },
  {
    path: "/admin",
    element: <AdminDashboard />, // independent admin route
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
