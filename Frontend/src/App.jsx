import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Root from "./pages/Root";
import JobView from "./pages/JobView";
import SearchJob from "./pages/SearchJob";
import RegisterLogin from "./pages/RegisterLogin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "job",
        element: <JobView />,
      },
      {
        path: "jobs",
        element: <SearchJob />,
      },
      {
        path: "register",
        element: <RegisterLogin />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
