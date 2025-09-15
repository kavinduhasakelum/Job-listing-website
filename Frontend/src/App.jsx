import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Root from "./pages/Root";
import JobView from "./pages/JobView";
import SearchJob from "./pages/SearchJob";
import RegisterLogin from "./pages/RegisterLogin";
import JobPostForm from "./pages/JobPostForm";
import ChatPage from "./pages/Chat";

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
      {
        path: "postjob",
        element: <JobPostForm />,
      },
      {
        path: "search",
        element: <SearchJob />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
