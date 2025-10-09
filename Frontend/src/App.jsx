import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";

// Protected Route Components
import ProtectedRoute, {
  AdminRoute,
  EmployerRoute,
} from "./components/ProtectedRoute";

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
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AboutUs from "./pages/AboutUs"; // <-- NEW

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />, // layout with NavBar + Footer + <Outlet />
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      { path: "job", element: <JobView /> },
      { path: "jobs", element: <SearchJob /> },
      { path: "register", element: <RegisterLogin /> },
      {
        path: "post-job",
        element: (
          <EmployerRoute>
            <JobPostForm />
          </EmployerRoute>
        ),
      }, 
      { path: "search", element: <SearchJob /> },
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      { path: "find-jobs", element: <FindJobsPage /> },
      { path: "about", element: <AboutUs /> }, 
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ), // protected admin route
  },

  {
    path: "/employee",
    element: <EmployeeDashboard/>, // independent admin route
  },

]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
