import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

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
import EmployerDashboard from "./pages/EmployerDashboard";
import AboutUs from "./pages/AboutUs"; // <-- NEW
import EmployerProfileForm from "./pages/EmployerProfileForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AllJobs from "./pages/AllJobs";

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

      { path: "all-jobs", element: <AllJobs /> },
      { path: "register", element: <RegisterLogin /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
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
      { path: "about", element: <AboutUs /> },
      {
        path: "employer/profile",
        element: (
          <EmployerRoute>
            <EmployerProfileForm />
          </EmployerRoute>
        ),
      },
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
    path: "/employer-dashboard",
    element: (
      <EmployerRoute>
        <EmployerDashboard />
      </EmployerRoute>
    ),
  },
  {
    path: "/employee",
    element: <Navigate to="/employer-dashboard" replace />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
