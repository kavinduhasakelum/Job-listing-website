import React from "react";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Root from "./pages/Root";
import JobView from "./pages/JobView";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path:"job",
        element:<JobView />
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App;
